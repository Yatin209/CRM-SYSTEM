import { isMongoReady } from "../config/db.js";
import { memoryState } from "../data/memoryStore.js";
import Activity from "../models/Activity.js";
import Customer from "../models/Customer.js";
import Lead from "../models/Lead.js";
import Task from "../models/Task.js";
import Campaign from "../models/Campaign.js";

// Pipeline columns now mirror Lead.status exactly.
const stages = [
  "New",
  "Contacted",
  "Interested",
  "Qualified",
  "Proposal Sent",
  "Negotiation",
  "Converted",
  "Lost",
];

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
      recentActivities,
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
            _id: "$status",
            value: { $sum: "$value" },
            count: { $sum: 1 },
          },
        },
      ]),
      Campaign.countDocuments(),
      Activity.find().sort("-createdAt").limit(15),
    ]);

    const pipeline = stages.map((stage) => {
      const found = pipelineAgg.find((item) => item._id === stage);
      return { stage, value: found?.value || 0, count: found?.count || 0 };
    });

    return {
      metrics: {
        totalCustomers,
        totalLeads,
        activeLeads: totalLeads - convertedLeads,
        convertedLeads,
        pendingFollowUps: pendingTasks,
        monthlyRevenue: revenueAgg[0]?.total || 0,
        totalCampaigns,
      },
      pipeline,
      activities: recentActivities.map((a) => ({
        id: a.id?.toString?.() || a._id?.toString?.(),
        label: a.label,
        detail: a.detail,
        actor: a.actor,
        tone: a.tone,
        time: a.createdAt,
      })),
    };
  }

  const state = memoryState();
  const convertedLeads = state.leads.filter(
    (lead) => lead.status === "Converted",
  ).length;
  return {
    metrics: {
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
    },
    pipeline: stages.map((stage) => {
      const records = state.leads.filter((lead) => lead.status === stage);
      return { stage, value: sum(records, "value"), count: records.length };
    }),
    activities: state.activities,
    notifications: state.notifications,
  };
}
