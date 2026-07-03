import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "react-toastify";
import { http } from "../api/http.js";
import { useAuth } from "./AuthContext.jsx";
import {
  activities as fallbackActivities,
  categoryData as fallbackCategoryData,
  conversionData as fallbackConversionData,
  demoUsers,
  initialCommunications,
  initialCustomers,
  initialLeads,
  initialTasks,
  leadStatuses as fallbackLeadStatuses,
  revenueData as fallbackRevenueData,
  teamPerformance as fallbackTeamPerformance,
} from "../data/mockData.js";

dayjs.extend(relativeTime);

const CrmDataContext = createContext(null);

const campaignStatuses = [
  "Draft",
  "Active",
  "Paused",
  "Completed",
  "Cancelled",
];

function currency(value) {
  return Number(value || 0);
}

export function CrmDataProvider({ children }) {
  const { user } = useAuth();

  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState(demoUsers);
  const [communications] = useState(initialCommunications);
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [activityLog, setActivityLog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /* ── Fetchers ─────────────────────────────────────────── */
  const fetchLeads = useCallback(async () => {
    try {
      const res = await http.get("/leads", { params: { limit: 100 } });
      const data = res.data?.data || [];
      setLeads(Array.isArray(data) ? data : initialLeads);
    } catch (err) {
      console.warn("Could not fetch leads, using local fallback:", err.message);
      setLeads((prev) => (prev.length ? prev : initialLeads));
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await http.get("/customers", { params: { limit: 100 } });
      const data = res.data?.data || [];
      setCustomers(Array.isArray(data) ? data : initialCustomers);
    } catch (err) {
      console.warn(
        "Could not fetch customers, using local fallback:",
        err.message,
      );
      setCustomers((prev) => (prev.length ? prev : initialCustomers));
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await http.get("/tasks", { params: { limit: 100 } });
      const data = res.data?.data || [];
      setTasks(Array.isArray(data) ? data : initialTasks);
    } catch (err) {
      console.warn("Could not fetch tasks, using local fallback:", err.message);
      setTasks((prev) => (prev.length ? prev : initialTasks));
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await http.get("/users", { params: { limit: 100 } });
      const data = res.data?.data || [];
      if (Array.isArray(data) && data.length) setUsers(data);
    } catch (err) {
      // Most non-admin roles can't list users — that's expected, not a bug.
      console.warn(
        "Could not fetch users (likely insufficient role):",
        err.message,
      );
    }
  }, []);

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await http.get("/campaigns", { params: { limit: 100 } });
      const data = res.data?.data || [];
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Could not fetch campaigns:", err.message);
      setCampaigns((prev) => (prev.length ? prev : []));
    }
  }, []);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await http.get("/activities", {
        params: { limit: 20, sort: "-createdAt" },
      });
      const data = res.data?.data || [];
      setActivityLog(
        Array.isArray(data)
          ? data.map((a) => ({
              id: a.id,
              label: a.label,
              detail: a.detail,
              time: dayjs(a.createdAt).fromNow?.() || "",
              tone: a.tone || "primary",
            }))
          : [],
      );
    } catch (err) {
      console.warn("Could not fetch activity log:", err.message);
      setActivityLog(null);
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await http.get("/dashboard");
      setDashboardMetrics(res.data?.data || null);
    } catch (err) {
      console.warn("Could not fetch dashboard metrics:", err.message);
      setDashboardMetrics(null);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      fetchLeads(),
      fetchCustomers(),
      fetchTasks(),
      fetchUsers(),
      fetchCampaigns(),
      fetchDashboard(),
      fetchActivities(),
    ]);
    setIsLoading(false);
  }, [
    fetchLeads,
    fetchCustomers,
    fetchTasks,
    fetchUsers,
    fetchCampaigns,
    fetchDashboard,
    fetchActivities,
  ]);

  // Load data once authenticated
  useEffect(() => {
    if (user) refreshAll();
  }, [user, refreshAll]);

  /* ── Mutations (each refreshes dashboard stats afterwards) ─ */
  const addLead = useCallback(
    async (payload) => {
      try {
        const ownerName =
          payload.owner ||
          (payload.ownerId
            ? users.find((u) => u.id === payload.ownerId)?.name
            : undefined) ||
          "Unassigned";
        const status = payload.status || "New";
        const leadData = {
          name: payload.name,
          company: payload.company,
          email: payload.email,
          phone: payload.phone,
          source: payload.source || "Web Form",
          status,
          // The pipeline stage always mirrors the selected status, so a
          // new lead lands in the matching pipeline column instead of
          // always starting in the first one.
          stage: status,
          category: payload.category || "Mid Market",
          address: payload.address || "",
          value: currency(payload.value),
          owner: ownerName,
          ownerId: payload.ownerId || null,
          nextFollowUp:
            payload.nextFollowUp || dayjs().add(2, "day").format("YYYY-MM-DD"),
          expectedClose:
            payload.expectedClose ||
            dayjs().add(21, "day").format("YYYY-MM-DD"),
          notes: payload.notes || "",
        };
        const res = await http.post("/leads", leadData);
        const newLead = res.data?.data || leadData;
        setLeads((cur) => [newLead, ...cur]);
        toast.success("✓ Lead created");
        if (ownerName && ownerName !== "Unassigned") {
          toast(`🔔 ${ownerName} has been assigned a new lead: ${leadData.name}`);
        }
        fetchDashboard();
        fetchActivities();
        return newLead;
      } catch (error) {
        const msg =
          error.response?.data?.message ||
          error.response?.data?.data?.errors?.[0]?.msg ||
          "Failed to create lead";
        toast.error(msg);
        throw error;
      }
    },
    [fetchDashboard, fetchActivities, users],
  );

  const updateLead = useCallback(
    async (id, patch) => {
      try {
        const patchWithOwner = { ...patch };
        if (patch.ownerId && !patch.owner) {
          patchWithOwner.owner =
            users.find((u) => u.id === patch.ownerId)?.name || patch.owner;
        }
        if (patch.ownerId) {
          patchWithOwner.ownerId = patch.ownerId;
        }
        // Editing a lead moves it to the matching pipeline column the
        // moment its status changes — keep stage mirrored on every update.
        if (patch.status) {
          patchWithOwner.stage = patch.status;
        }

        const res = await http.put(`/leads/${id}`, patchWithOwner);
        const updated = {
          ...(res.data?.data || patchWithOwner),
          updatedBy: user?.name || "Unknown",
        };
        setLeads((cur) =>
          cur.map((l) => (l.id || l.id) === id? { ...l, ...updatedLead } : l,),);
        toast.success("✓ Lead updated");
        const priorOwner = leads.find((l) => l.id === id)?.ownerId;
        if (
          patchWithOwner.ownerId &&
          patchWithOwner.ownerId !== priorOwner &&
          patchWithOwner.owner
        ) {
          toast(`🔔 ${patchWithOwner.owner} has been assigned this lead`);
        }
        fetchDashboard();
        fetchActivities();
        return updated;
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update lead");
        throw error;
      }
    },
    [fetchDashboard, fetchActivities, users],
  );

  const updateLeadStage = useCallback(
    async (id, stage) => {
      try {
        const res = await http.put(`/leads/${id}/stage`, { stage });
        const updated = res.data?.data || { stage };
        setLeads((cur) =>
          cur.map((l) => (l.id === id ? { ...l, ...updated } : l)),
        );
        toast.success("✓ Lead stage updated");
        fetchDashboard();
        fetchActivities();
        return updated;
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to update lead stage",
        );
        throw error;
      }
    },
    [fetchDashboard, fetchActivities],
  );

  const convertLead = useCallback(
    async (id) => {
      try {
        const res = await http.post(`/leads/${id}/convert`);
        const { lead: updatedLead, customer: newCustomer } =
          res.data?.data || {};
        if (updatedLead) {
          setLeads((cur) =>
            cur.map((l) => (l.id === id ? { ...l, ...updatedLead } : l)),
          );
        }
        if (newCustomer) {
          setCustomers((cur) => [newCustomer, ...cur]);
        }
        toast.success(`✓ Lead converted to customer`);
        fetchDashboard();
        fetchActivities();
        return { lead: updatedLead, customer: newCustomer };
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to convert lead");
        throw error;
      }
    },
    [fetchDashboard, fetchActivities],
  );

  const removeLead = useCallback(
    async (id) => {
      try {
        await http.delete(`/leads/${id}`);
        setLeads((cur) => cur.filter((l) => l.id !== id));
        toast.success("✓ Lead deleted");
        fetchDashboard();
        fetchActivities();
        return true;
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete lead");
        throw error;
      }
    },
    [fetchDashboard, fetchActivities],
  );

  const addCustomer = useCallback(
    async (payload) => {
      try {
        const customerData = {
          name: payload.name,
          company: payload.company,
          email: payload.email,
          phone: payload.phone || payload.phone || "",
          address: payload.address || "",
          category: payload.category || "Mid Market",
          owner: payload.owner || "Unassigned",
          status: payload.status || "Active",
          value: currency(payload.value),
          notes: payload.notes || "",
        };
        const res = await http.post("/customers", customerData);
        const newCustomer = res.data?.data || customerData;
        setCustomers((cur) => [newCustomer, ...cur]);
        toast.success("✓ Customer added");
        fetchDashboard();
        fetchActivities();
        return newCustomer;
      } catch (error) {
        const msg =
          error.response?.data?.message ||
          error.response?.data?.data?.errors?.[0]?.msg ||
          "Failed to add customer";
        toast.error(msg);
        throw error;
      }
    },
    [fetchDashboard, fetchActivities],
  );

  const updateCustomer = useCallback(
    async (id, patch) => {
      try {
        const res = await http.put(`/customers/${id}`, patch);
        const updated = res.data?.data || patch;
        setCustomers((cur) =>
          cur.map((c) => (c.id === id ? { ...c, ...updated } : c)),
        );
        toast.success("✓ Customer updated");
        fetchDashboard();
        fetchActivities();
        return updated;
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to update customer",
        );
        throw error;
      }
    },
    [fetchDashboard, fetchActivities],
  );

  const deleteCustomer = useCallback(
    async (id) => {
      try {
        await http.delete(`/customers/${id}`);
        setCustomers((cur) => cur.filter((c) => c.id !== id));
        toast.success("✓ Customer deleted");
        fetchDashboard();
        fetchActivities();
        return true;
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete customer",
        );
        throw error;
      }
    },
    [fetchDashboard, fetchActivities],
  );

  const addCampaign = useCallback(
    async (payload) => {
      try {
        const campaignData = {
          ...payload,
          budget: currency(payload.budget),
          expectedRevenue: currency(payload.expectedRevenue),
          actualRevenue: currency(payload.actualRevenue),
          roi:
            payload.budget > 0
              ? Math.round(
                  (((payload.actualRevenue || 0) - payload.budget) /
                    payload.budget) *
                    100,
                )
              : 0,
        };
        const res = await http.post("/campaigns", campaignData);
        const newCampaign = res.data?.data || campaignData;
        setCampaigns((cur) => [newCampaign, ...cur]);
        toast.success("✓ Campaign created");
        fetchDashboard();
        fetchActivities();
        return newCampaign;
      } catch (error) {
        const msg =
          error.response?.data?.message ||
          error.response?.data?.data?.errors?.[0]?.msg ||
          "Failed to create campaign";
        toast.error(msg);
        throw error;
      }
    },
    [fetchDashboard, fetchActivities],
  );

  const updateCampaign = useCallback(
    async (id, patch) => {
      try {
        const res = await http.put(`/campaigns/${id}`, {
          ...patch,
          budget: currency(patch.budget),
          expectedRevenue: currency(patch.expectedRevenue),
          actualRevenue: currency(patch.actualRevenue),
        });
        const updated = res.data?.data || patch;
        setCampaigns((cur) =>
          cur.map((c) => (c.id === id ? { ...c, ...updated } : c)),
        );
        toast.success("✓ Campaign updated");
        fetchDashboard();
        fetchActivities();
        return updated;
      } catch (error) {
        const msg =
          error.response?.data?.message || "Failed to update campaign";
        toast.error(msg);
        throw error;
      }
    },
    [fetchDashboard, fetchActivities],
  );

  const removeCampaign = useCallback(
    async (id) => {
      try {
        await http.delete(`/campaigns/${id}`);
        setCampaigns((cur) => cur.filter((c) => c.id !== id));
        toast.success("✓ Campaign deleted");
        fetchDashboard();
        fetchActivities();
        return true;
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete campaign",
        );
        throw error;
      }
    },
    [fetchDashboard, fetchActivities],
  );

  const addTask = useCallback(
    async (payload) => {
      try {
        const taskData = {
          title: payload.title,
          type: payload.type || "Follow-up",
          relatedTo: payload.relatedTo || "",
          dueDate:
            payload.dueDate || dayjs().add(1, "day").format("YYYY-MM-DD"),
          status: payload.status || "Open",
          priority: payload.priority || "Medium",
          assignee: payload.assignee || "Unassigned",
        };
        const res = await http.post("/tasks", taskData);
        const newTask = res.data?.data || taskData;
        setTasks((cur) => [newTask, ...cur]);
        toast.success("✓ Task created");
        fetchDashboard();
        fetchActivities();
        return newTask;
      } catch (error) {
        const msg =
          error.response?.data?.message ||
          error.response?.data?.data?.errors?.[0]?.msg ||
          "Failed to create task";
        toast.error(msg);
        throw error;
      }
    },
    [fetchDashboard, fetchActivities],
  );

  const updateTask = useCallback(
    async (id, patch) => {
      try {
        const res = await http.put(`/tasks/${id}`, patch);
        const updated = res.data?.data || patch;
        setTasks((cur) =>
          cur.map((t) => (t.id === id ? { ...t, ...updated } : t)),
        );
        toast.success("✓ Task updated");
        fetchDashboard();
        fetchActivities();
        return updated;
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update task");
        throw error;
      }
    },
    [fetchDashboard, fetchActivities],
  );

  const addUser = useCallback(async (payload) => {
    try {
      const res = await http.post("/users", payload);
      const newUser = res.data?.data || payload;
      setUsers((cur) => [newUser, ...cur]);
      toast.success(`✓ User ${payload.name} created`);
      fetchActivities();
      return newUser;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.data?.errors?.[0]?.msg ||
        "Failed to create user";
      toast.error(msg);
      throw error;
    }
  }, [fetchActivities]);

  const updateUser = useCallback(async (id, patch) => {
    try {
      const res = await http.put(`/users/${id}`, patch);
      const updated = res.data?.data || patch;
      setUsers((cur) =>
        cur.map((u) => (u.id === id ? { ...u, ...updated } : u)),
      );
      toast.success("✓ User updated");
      fetchActivities();
      return updated;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.data?.errors?.[0]?.msg ||
        "Failed to update user";
      toast.error(msg);
      throw error;
    }
  }, [fetchActivities]);

  /* ── Derived data (client-side, always live) ─────────────── */
  const metrics = useMemo(() => {
    const totalLeadValue = leads.reduce((sum, l) => sum + currency(l.value), 0);
    const monthlyRevenue =
      dashboardMetrics?.monthlyRevenue ??
      customers.reduce((sum, c) => sum + currency(c.value), 0);
    const pendingFollowUps =
      tasks.filter((t) => t.status !== "Completed").length +
      leads.filter(
        (l) =>
          l.nextFollowUp && dayjs(l.nextFollowUp).diff(dayjs(), "day") <= 3,
      ).length;

    return {
      totalCustomers: dashboardMetrics?.totalCustomers ?? customers.length,
      totalLeads: dashboardMetrics?.totalLeads ?? leads.length,
      activeLeads:
        dashboardMetrics?.activeLeads ??
        leads.filter((l) => !["Converted", "Lost"].includes(l.status)).length,
      convertedLeads:
        dashboardMetrics?.convertedLeads ??
        leads.filter((l) => l.status === "Converted").length,
      pendingFollowUps: dashboardMetrics?.pendingFollowUps ?? pendingFollowUps,
      upcomingMeetings: tasks.filter(
        (t) => t.type === "Meeting" && t.status !== "Completed",
      ).length,
      monthlyRevenue,
      totalLeadValue,
    };
  }, [customers, leads, tasks, dashboardMetrics, campaigns]);

  // Lead status options — database-driven via GET /dashboard, so the Lead
  // form's status dropdown and the Pipeline board are always fed the exact
  // same list instead of two independently hardcoded arrays.
  const leadStatuses = useMemo(
    () =>
      dashboardMetrics?.leadStatuses?.length
        ? dashboardMetrics.leadStatuses
        : fallbackLeadStatuses,
    [dashboardMetrics],
  );

  // Pipeline columns are the same statuses minus "Converted" (a converted
  // lead leaves the pipeline and lands in Customers instead) — no more
  // separate "Won" column.
  const pipelineStages = useMemo(
    () => leadStatuses.filter((status) => status !== "Converted"),
    [leadStatuses],
  );

  // Always derived live from the current `leads` state (not from the last
  // dashboard fetch), so every create / update / delete / conversion is
  // reflected on the Pipeline and Dashboard instantly, with no page
  // refresh and no dependency on a round-trip to the server.
  const pipeline = useMemo(
    () =>
      pipelineStages.map((stage) => {
        const stageLeads = leads.filter((l) => (l.status || l.stage) === stage);
        return {
          stage,
          leads: stageLeads,
          value: stageLeads.reduce((sum, l) => sum + currency(l.value), 0),
          count: stageLeads.length,
        };
      }),
    [leads, pipelineStages],
  );

  // Revenue trend built from live customer + lead data (last 6 months)
  const revenueData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) =>
      dayjs().subtract(5 - i, "month"),
    );
    return months.map((m) => {
      const label = m.format("MMM");
      const monthCustomers = customers.filter((c) =>
        dayjs(c.createdAt || c.lastContact).isSame(m, "month"),
      );
      const revenue =
        monthCustomers.reduce((sum, c) => sum + currency(c.value), 0) ||
        Math.round(metrics.monthlyRevenue / 6);
      return { month: label, revenue, target: Math.round(revenue * 0.85) };
    });
  }, [customers, metrics.monthlyRevenue]);

  const conversionData = useMemo(
    () =>
      leadStatuses.map((status) => ({
        name: status,
        value: leads.filter((l) => l.status === status).length,
      })),
    [leads, leadStatuses],
  );

  const categoryData = useMemo(() => {
    const groups = ["Enterprise", "Mid Market", "SMB", "Strategic"];
    return groups
      .map((name) => ({
        name,
        value: customers.filter((c) => c.category === name).length,
      }))
      .filter((g) => g.value > 0);
  }, [customers]);

  const teamPerformance = useMemo(() => {
    if (!users?.length) return fallbackTeamPerformance;
    return users
      .filter((u) => u.role !== "Administrator")
      .map((u) => ({
        name: u.name.split(" ")[0],
        score: u.performance ?? 75,
        deals: Math.round((u.performance ?? 75) / 8),
      }));
  }, [users]);

  const activities = useMemo(() => {
    if (activityLog && activityLog.length) return activityLog;
    if (activityLog !== null) {
      // Backend returned an empty (but valid) activity log — nothing to show yet.
      return [];
    }
    // Fallback used only if the /activities API call failed outright.
    const recent = [
      ...leads.slice(0, 3).map((l) => ({
        id: `l-${l.id}`,
        label: `Lead updated by ${l.updatedBy || l.owner || "Unknown"}`,
        detail: `${l.name} — ${l.company}`,
        time: dayjs(l.updatedAt || l.createdAt).fromNow?.() || "",
        tone: "primary",
      })),
      ...customers.slice(0, 2).map((c) => ({
        id: `c-${c.id}`,
        label: "Customer record",
        detail: c.company,
        time: dayjs(c.updatedAt || c.createdAt).fromNow?.() || "",
        tone: "success",
      })),
      ...campaigns.slice(0, 2).map((c) => ({
        id: `camp-${c.id}`,
        label: "Campaign updated",
        detail: c.name,
        time: dayjs(c.updatedAt || c.createdAt).fromNow?.() || "",
        tone: "info",
      })),
    ];
    return recent.length ? recent : fallbackActivities;
  }, [activityLog, leads, customers, campaigns]);

  const analytics = useMemo(
    () => ({
      categoryData: categoryData.length ? categoryData : fallbackCategoryData,
      conversionData: conversionData.some((d) => d.value > 0)
        ? conversionData
        : fallbackConversionData,
      revenueData: revenueData.length ? revenueData : fallbackRevenueData,
      campaignStatusData: campaignStatuses.map((status) => ({
        name: status,
        value: campaigns.filter((c) => c.status === status).length,
      })),
      campaignBudgetRevenue: campaigns.slice(0, 8).map((campaign) => ({
        name: campaign.name,
        budget: Number(campaign.budget || 0),
        actualRevenue: Number(campaign.actualRevenue || 0),
      })),
      topCampaigns: [...campaigns]
        .sort(
          (a, b) =>
            Number(b.roi || 0) - Number(a.roi || 0) ||
            Number(b.actualRevenue || 0) - Number(a.actualRevenue || 0),
        )
        .slice(0, 5),
      teamPerformance,
    }),
    [categoryData, conversionData, revenueData, teamPerformance, campaigns],
  );

  const value = useMemo(
    () => ({
      activities,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addLead,
      addTask,
      addUser,
      updateUser,
      analytics,
      communications,
      customers,
      leads,
      campaigns,
      metrics,
      pipeline,
      leadStatuses,
      pipelineStages,
      tasks,
      updateLead,
      updateLeadStage,
      convertLead,
      removeLead,
      updateTask,
      addCampaign,
      updateCampaign,
      removeCampaign,
      users,
      isLoading,
      refreshAll,
    }),
    [
      activities,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addLead,
      addTask,
      addUser,
      updateUser,
      analytics,
      communications,
      customers,
      leads,
      campaigns,
      metrics,
      pipeline,
      leadStatuses,
      pipelineStages,
      tasks,
      updateLead,
      updateLeadStage,
      convertLead,
      removeLead,
      updateTask,
      addCampaign,
      updateCampaign,
      removeCampaign,
      users,
      isLoading,
      refreshAll,
    ],
  );

  return (
    <CrmDataContext.Provider value={value}>{children}</CrmDataContext.Provider>
  );
}

export function useCrmData() {
  const context = useContext(CrmDataContext);
  if (!context)
    throw new Error("useCrmData must be used inside CrmDataProvider");
  return context;
}
