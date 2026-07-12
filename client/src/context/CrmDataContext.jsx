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
  pipelineStages,
  revenueData as fallbackRevenueData,
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

function filterVisibleTasksForUser(user, records = []) {
  if (!user || user.role === "Administrator") {
    return records;
  }

  const assignees = new Set([user.name, user.email].filter(Boolean));
  return records.filter((task) => assignees.has(task.assignee));
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
  const [notifications, setNotifications] = useState([]);
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
      setTasks(filterVisibleTasksForUser(user, Array.isArray(data) ? data : initialTasks));
    } catch (err) {
      console.warn("Could not fetch tasks, using local fallback:", err.message);
      setTasks((prev) => (prev.length ? filterVisibleTasksForUser(user, prev) : filterVisibleTasksForUser(user, initialTasks)));
    }
  }, [user]);

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

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await http.get("/dashboard");
      setDashboardMetrics(res.data?.data || null);
    } catch (err) {
      console.warn("Could not fetch dashboard metrics:", err.message);
      setDashboardMetrics(null);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await http.get("/notifications", { params: { limit: 50 } });
      const data = res.data?.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Could not fetch notifications:", err.message);
      setNotifications([]);
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
      fetchNotifications(),
    ]);
    setIsLoading(false);
  }, [
    fetchLeads,
    fetchCustomers,
    fetchTasks,
    fetchUsers,
    fetchCampaigns,
    fetchDashboard,
    fetchNotifications,
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
        const leadData = {
          name: payload.name,
          company: payload.company,
          email: payload.email,
          phone: payload.phone,
          source: payload.source || "Web Form",
          status: payload.status || "New",
          category: payload.category || "Mid Market",
          priority: payload.priority || "Medium",
          industry: payload.industry || "Other",
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
        fetchDashboard();
        fetchNotifications(); // Refresh notifications after lead assignment
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
    [fetchDashboard, fetchNotifications, users],
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

        const res = await http.put(`/leads/${id}`, patchWithOwner);
        const updated = res.data?.data || patchWithOwner;
        const { customer: convertedCustomer, removedCustomerId, ...leadFields } = updated;
        
        console.log("updateLead response:", { convertedCustomer, removedCustomerId, leadFields });
        
        setLeads((cur) =>
          cur.map((l) => (l.id === id ? { ...l, ...leadFields } : l)),
        );
        if (convertedCustomer) {
          setCustomers((cur) => [
            convertedCustomer,
            ...cur.filter((c) => c.id !== convertedCustomer.id),
          ]);
          toast.success("✓ Lead converted to customer");
        } else if (removedCustomerId) {
          console.log("Removing customer with ID:", removedCustomerId);
          console.log("Current customers before filter:", customers.map(c => ({ id: c.id, _id: c._id, name: c.name })));
          
          setCustomers((cur) => {
            const filtered = cur.filter((c) => {
              // Handle both string and object ID comparison
              const customerId = c.id || c._id;
              const shouldKeep = customerId !== removedCustomerId && customerId?.toString() !== removedCustomerId?.toString();
              console.log(`Comparing customer ${customerId} with ${removedCustomerId}: shouldKeep=${shouldKeep}`);
              return shouldKeep;
            });
            console.log("Customers after filter:", filtered.map(c => ({ id: c.id, name: c.name })));
            return filtered;
          });
          toast.success("✓ Lead moved out of Converted — removed from Customers");
        } else {
          toast.success("✓ Lead updated");
        }
        fetchDashboard();
        if (patch.ownerId) {
          fetchNotifications(); // Refresh notifications after lead reassignment
        }
        return updated;
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update lead");
        throw error;
      }
    },
    [fetchDashboard, fetchNotifications, users, customers],
  );

  const updateLeadStage = useCallback(
    async (id, stage) => {
      try {
        const res = await http.put(`/leads/${id}/stage`, { stage });
        const updated = res.data?.data || { status: stage };
        const { customer: convertedCustomer, removedCustomerId, ...leadFields } = updated;
        
        console.log("updateLeadStage response:", { convertedCustomer, removedCustomerId, leadFields });
        
        setLeads((cur) =>
          cur.map((l) => (l.id === id ? { ...l, ...leadFields } : l)),
        );
        if (convertedCustomer) {
          setCustomers((cur) => [
            convertedCustomer,
            ...cur.filter((c) => c.id !== convertedCustomer.id),
          ]);
          toast.success("✓ Lead converted to customer");
        } else if (removedCustomerId) {
          console.log("Removing customer with ID:", removedCustomerId);
          console.log("Current customers before filter:", customers.map(c => ({ id: c.id, _id: c._id, name: c.name })));
          
          setCustomers((cur) => {
            const filtered = cur.filter((c) => {
              // Handle both string and object ID comparison
              const customerId = c.id || c._id;
              const shouldKeep = customerId !== removedCustomerId && customerId?.toString() !== removedCustomerId?.toString();
              console.log(`Comparing customer ${customerId} with ${removedCustomerId}: shouldKeep=${shouldKeep}`);
              return shouldKeep;
            });
            console.log("Customers after filter:", filtered.map(c => ({ id: c.id, name: c.name })));
            return filtered;
          });
          toast.success("✓ Lead moved out of Converted — removed from Customers");
        } else {
          toast.success("✓ Pipeline updated");
        }
        fetchDashboard();
        return updated;
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to update lead stage",
        );
        throw error;
      }
    },
    [fetchDashboard, customers],
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
        return { lead: updatedLead, customer: newCustomer };
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to convert lead");
        throw error;
      }
    },
    [fetchDashboard],
  );

  const removeLead = useCallback(
    async (id) => {
      try {
        await http.delete(`/leads/${id}`);
        setLeads((cur) => cur.filter((l) => l.id !== id));
        toast.success("✓ Lead deleted");
        fetchDashboard();
        return true;
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete lead");
        throw error;
      }
    },
    [fetchDashboard],
  );

  const addCustomer = useCallback(
    async (payload) => {
      try {
        const customerData = {
          name: payload.name,
          company: payload.company,
          email: payload.email,
          phone: payload.phone || payload.mobile || "",
          address: payload.address || "",
          category: payload.category || "Mid Market",
          industry: payload.industry || "Other",
          owner: payload.owner || "Unassigned",
          status: payload.status || "Active",
          value: currency(payload.value ?? payload.annualValue),
          notes: payload.notes || "",
        };
        const res = await http.post("/customers", customerData);
        const newCustomer = res.data?.data || customerData;
        setCustomers((cur) => [newCustomer, ...cur]);
        toast.success("✓ Customer added");
        fetchDashboard();
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
    [fetchDashboard],
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
        return updated;
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to update customer",
        );
        throw error;
      }
    },
    [fetchDashboard],
  );

  const removeCustomer = useCallback(
    async (id) => {
      try {
        await http.delete(`/customers/${id}`);
        setCustomers((cur) => cur.filter((c) => c.id !== id));
        toast.success("✓ Customer deleted");
        fetchDashboard();
        return true;
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete customer",
        );
        throw error;
      }
    },
    [fetchDashboard],
  );

  const addCampaign = useCallback(
    async (payload) => {
      try {
        const campaignData = {
          name: payload.name,
          type: payload.type,
          owner: payload.owner,
          status: payload.status || "Draft",
          customer: payload.customer || null,
          startDate: payload.startDate,
          endDate: payload.endDate,
          description: payload.description || "",
        };
        const res = await http.post("/campaigns", campaignData);
        const newCampaign = res.data?.data || campaignData;
        setCampaigns((cur) => [newCampaign, ...cur]);
        toast.success("✓ Campaign created");
        fetchCampaigns();
        fetchDashboard();
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
    [fetchCampaigns, fetchDashboard],
  );

  const updateCampaign = useCallback(
    async (id, patch) => {
      try {
        const res = await http.put(`/campaigns/${id}`, patch);
        const updated = res.data?.data || patch;
        setCampaigns((cur) =>
          cur.map((c) => (c.id === id ? { ...c, ...updated } : c)),
        );
        toast.success("✓ Campaign updated");
        fetchCampaigns();
        fetchDashboard();
        return updated;
      } catch (error) {
        const msg =
          error.response?.data?.message || "Failed to update campaign";
        toast.error(msg);
        throw error;
      }
    },
    [fetchCampaigns, fetchDashboard],
  );

  const removeCampaign = useCallback(
    async (id) => {
      try {
        await http.delete(`/campaigns/${id}`);
        setCampaigns((cur) => cur.filter((c) => c.id !== id));
        toast.success("✓ Campaign deleted");
        fetchDashboard();
        return true;
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete campaign",
        );
        throw error;
      }
    },
    [fetchDashboard],
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
          status: payload.status || "Pending",
          priority: payload.priority || "Medium",
          assignee: payload.assignee || "Unassigned",
        };
        const res = await http.post("/tasks", taskData);
        const newTask = res.data?.data || taskData;
        setTasks((cur) => (filterVisibleTasksForUser(user, [newTask]).length ? [newTask, ...cur] : cur));
        toast.success("✓ Task created");
        fetchDashboard();
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
    [fetchDashboard, user],
  );

  const updateTask = useCallback(
    async (id, patch) => {
      try {
        const res = await http.put(`/tasks/${id}`, patch);
        const updated = res.data?.data || patch;
        setTasks((cur) =>
          cur.reduce((next, task) => {
            if (task.id !== id) return [...next, task];
            const merged = { ...task, ...updated };
            return filterVisibleTasksForUser(user, [merged]).length ? [...next, merged] : next;
          }, []),
        );
        toast.success("✓ Task updated");
        fetchDashboard();
        return updated;
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update task");
        throw error;
      }
    },
    [fetchDashboard, user],
  );

  const deleteTask = useCallback(
    async (id) => {
      try {
        await http.delete(`/tasks/${id}`);
        setTasks((cur) => cur.filter((t) => t.id !== id));
        toast.success("✓ Task deleted");
        fetchDashboard();
        return true;
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete task");
        throw error;
      }
    },
    [fetchDashboard],
  );

  const addUser = useCallback(async (payload) => {
    try {
      const res = await http.post("/users", payload);
      const newUser = res.data?.data || payload;
      setUsers((cur) => [newUser, ...cur]);
      toast.success(`✓ User ${payload.name} created`);
      return newUser;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.data?.errors?.[0]?.msg ||
        "Failed to create user";
      toast.error(msg);
      throw error;
    }
  }, []);

  const updateUser = useCallback(async (id, patch) => {
    try {
      const res = await http.put(`/users/${id}`, patch);
      const updated = res.data?.data || patch;
      setUsers((cur) => cur.map((u) => (u.id === id ? { ...u, ...updated } : u)));
      toast.success("✓ User updated");
      return updated;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.data?.errors?.[0]?.msg ||
        "Failed to update user";
      toast.error(msg);
      throw error;
    }
  }, []);

  const markNotificationRead = useCallback(async (id) => {
    try {
      await http.put(`/notifications/${id}`, { read: true });
      setNotifications((cur) =>
        cur.map((n) => (n.id === id || n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.warn("Failed to mark notification as read:", error.message);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    try {
      const unreadIds = notifications
        .filter((n) => !n.read)
        .map((n) => n.id || n._id);
      
      await Promise.all(
        unreadIds.map((id) => http.put(`/notifications/${id}`, { read: true }))
      );
      
      setNotifications((cur) =>
        cur.map((n) => ({ ...n, read: true }))
      );
      toast.success("✓ All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark notifications as read");
    }
  }, [notifications]);

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
  }, [customers, leads, tasks, dashboardMetrics]);

  const pipeline = useMemo(() => {
    if (dashboardMetrics?.pipeline?.length) {
      return dashboardMetrics.pipeline.map((p) => ({
        stage: p.stage,
        value: p.value,
        count: p.count,
        leads: leads.filter((l) => l.status === p.stage),
      }));
    }
    return pipelineStages.map((stage) => {
      const stageLeads = leads.filter((l) => l.status === stage);
      return {
        stage,
        leads: stageLeads,
        count: stageLeads.length,
        value: stageLeads.reduce((sum, l) => sum + currency(l.value), 0),
      };
    });
  }, [leads, dashboardMetrics]);

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
    () => [
      { name: "New", value: leads.filter((l) => l.status === "New").length },
      {
        name: "Contacted",
        value: leads.filter((l) => l.status === "Contacted").length,
      },
      {
        name: "Qualified",
        value: leads.filter((l) => l.status === "Qualified").length,
      },
      {
        name: "Won",
        value: leads.filter((l) => l.status === "Converted").length,
      },
    ],
    [leads],
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

  const leadFunnel = useMemo(
    () =>
      pipelineStages.map((stage) => ({
        name: stage,
        value: leads.filter((l) => l.status === stage).length,
      })),
    [leads],
  );

  const activities = useMemo(() => {
    if (dashboardMetrics?.activities?.length) {
      return dashboardMetrics.activities.map((a) => ({
        id: a.id,
        label: a.label,
        detail: a.detail,
        time: a.time ? dayjs(a.time).fromNow() : "",
        tone: a.tone || "primary",
      }));
    }
    // Fallback (server activity feed unavailable): synthesize from recent
    // records, still attributing the actor where we know it.
    const recent = [
      ...leads.slice(0, 3).map((l) => ({
        id: `l-${l.id}`,
        label: `Lead updated by ${l.owner || "Unassigned"}`,
        detail: `${l.name} — ${l.company}`,
        time: dayjs(l.updatedAt || l.createdAt).fromNow?.() || "",
        tone: "primary",
      })),
      ...customers.slice(0, 2).map((c) => ({
        id: `c-${c.id}`,
        label: `Customer record updated by ${c.owner || "Unassigned"}`,
        detail: c.company,
        time: dayjs(c.updatedAt || c.createdAt).fromNow?.() || "",
        tone: "success",
      })),
      ...campaigns.slice(0, 2).map((c) => ({
        id: `camp-${c.id}`,
        label: `Campaign updated by ${c.owner || "Unassigned"}`,
        detail: c.name,
        time: dayjs(c.updatedAt || c.createdAt).fromNow?.() || "",
        tone: "info",
      })),
    ];
    return recent.length ? recent : fallbackActivities;
  }, [leads, customers, campaigns, dashboardMetrics]);

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
      leadFunnel,
    }),
    [categoryData, conversionData, revenueData, leadFunnel, campaigns],
  );

  const value = useMemo(
    () => ({
      activities,
      addCustomer,
      removeCustomer,
      updateCustomer,
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
      tasks,
      updateLead,
      updateLeadStage,
      convertLead,
      removeLead,
      updateTask,
      deleteTask,
      addCampaign,
      updateCampaign,
      removeCampaign,
      users,
      isLoading,
      refreshAll,
      notifications,
      fetchNotifications,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      activities,
      addCustomer,
      removeCustomer,
      updateCustomer,
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
      tasks,
      updateLead,
      updateLeadStage,
      convertLead,
      removeLead,
      updateTask,
      deleteTask,
      addCampaign,
      updateCampaign,
      removeCampaign,
      users,
      isLoading,
      refreshAll,
      notifications,
      fetchNotifications,
      markNotificationRead,
      markAllNotificationsRead,
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
