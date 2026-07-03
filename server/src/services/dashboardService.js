import { isMongoReady } from "../config/db.js";
import { memoryState } from "../data/memoryStore.js";
import Customer from "../models/Customer.js";
import Lead from "../models/Lead.js";
import Task from "../models/Task.js";
import Campaign from "../models/Campaign.js";
import { LEAD_STATUSES, PIPELINE_STAGES } from "../config/pipelineStages.js";

function sum(records, key) {
  return records.reduce((total, record) => total + Number(record[key] || 0), 0);
}

export async function getDashboard() {
  if (isMongoReady()) {
    const [
      totalCustomers,
      totalLeads,
      convertedLeads,
      pendingTasks,
      revenueAgg,
      pipelineAgg,
      totalCampaigns,
    ] = await Promise.all([
      Customer.countDocuments(),
      Lead.countDocuments(),
      Lead.countDocuments({ status: "Converted" }),
      Task.countDocuments({ status: { $ne: "Completed" } }),
      Customer.aggregate([
        { $group: { _id: null, total: { $sum: "$value" } } },
      ]),
      Lead.aggregate([
        {
          $group: {
            _id: "$stage",
            value: { $sum: "$value" },
            count: { $sum: 1 },
          },
        },
      ]),
      Campaign.countDocuments(),
    ]);

    // Pipeline columns are driven by PIPELINE_STAGES (database-agnostic,
    // single source of truth) instead of being hardcoded here — every
    // status except "Converted" gets a column, and leads are grouped by
    // their current `status`/`stage` (kept in sync — see leadService).
    const pipeline = PIPELINE_STAGES.map((stage) => {
      const found = pipelineAgg.find((item) => item._id === stage);
      return { stage, value: found?.value || 0, count: found?.count || 0 };
    });

    return {
      totalCustomers,
      totalLeads,
      activeLeads: totalLeads - convertedLeads,
      convertedLeads,
      pendingFollowUps: pendingTasks,
      monthlyRevenue: revenueAgg[0]?.total || 0,
      totalCampaigns,
      pipeline,
      leadStatuses: LEAD_STATUSES,
    };
  }

  const state = memoryState();
  const convertedLeads = state.leads.filter(
    (lead) => lead.status === "Converted",
  ).length;
  return {
    totalCustomers: state.customers.length,
    totalLeads: state.leads.length,
    activeLeads: state.leads.filter(
      (lead) => !["Converted", "Lost"].includes(lead.status),
    ).length,
    convertedLeads,
    pendingFollowUps:
      state.tasks.filter((task) => task.status !== "Completed").length +
      state.followUps.length,
    monthlyRevenue: sum(state.customers, "value"),
    totalCampaigns: state.campaigns.length,
    pipeline: PIPELINE_STAGES.map((stage) => {
      // Leads leaving the pipeline (Converted) never match a stage here.
      const records = state.leads.filter((lead) => (lead.status || lead.stage) === stage);
      return { stage, value: sum(records, "value"), count: records.length };
    }),
    leadStatuses: LEAD_STATUSES,
    activities: state.activities,
    notifications: state.notifications,
  };
}
