import dayjs from "dayjs";
import {
  BadgeIndianRupee,
  CalendarClock,
  ContactRound,
  Megaphone,
  Plus,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  ClipboardList,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Badge from "../components/common/Badge.jsx";
import Button from "../components/common/Button.jsx";
import FormField from "../components/common/FormField.jsx";
import Modal from "../components/common/Modal.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import StatCard from "../components/common/StatCard.jsx";
import { useCrmData } from "../context/CrmDataContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  formatCurrency,
  formatNumber,
  statusTone,
} from "../utils/formatters.js";

const CHART_COLORS = ["#0f9f8f", "#3f6ad8", "#f59e0b", "#ef6f6c", "#7c3aed"];
const PRIORITY_ICON = { High: "🔴", Medium: "🟠", Low: "🟢" };
const PRIORITY_TONE = { High: "danger", Medium: "warning", Low: "success" };

const initialCampaignForm = (users) => ({
  name: "",
  type: "Email",
  owner: users?.[0]?.name || "",
  status: "Draft",
  budget: 0,
  expectedRevenue: 0,
  actualRevenue: 0,
  startDate: dayjs().format("YYYY-MM-DD"),
  endDate: dayjs().add(14, "day").format("YYYY-MM-DD"),
  description: "",
});

/* ───────────────────── Quick-action modals ───────────────────── */
function NewLeadModal({ open, onClose, addLead, users, leadStatuses }) {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    source: "Web Form",
    value: "",
    status: "New",
    category: "Mid Market",
    address: "",
    ownerId: users?.[0]?.id || "",
    owner: users?.[0]?.name || "",
    nextFollowUp: new Date().toISOString().slice(0, 10),
    expectedClose: new Date(Date.now() + 21 * 86400000)
      .toISOString()
      .slice(0, 10),
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (open) {
      setForm((prev) => ({
        ...prev,
        ownerId: users?.[0]?.id || "",
        owner: users?.[0]?.name || "",
      }));
    }
  }, [open, users]);

  async function submit(e) {
    e.preventDefault();
    if (!form.name || !form.company || !form.email) return;
    setSaving(true);
    await addLead({
      ...form,
      value: Number(form.value) || 0,
      ownerId: form.ownerId,
      owner: users.find((u) => u.id === form.ownerId)?.name || form.owner,
    });
    setSaving(false);
    onClose();
  }

  return (
    <Modal open={open} title="New Lead" onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <div className="form-grid">
          <FormField label="Name">
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </FormField>
          <FormField label="Company Name">
            <input
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              required
            />
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
            />
          </FormField>
          <FormField label="Phone">
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </FormField>
          <FormField label="Source">
            <input
              value={form.source}
              onChange={(e) => set("source", e.target.value)}
            />
          </FormField>
          <FormField label="Value (₹)">
            <input
              type="number"
              value={form.value}
              onChange={(e) => set("value", e.target.value)}
            />
          </FormField>
          <FormField label="Status">
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              {leadStatuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Category">
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {["Strategic", "Enterprise", "Mid Market", "SMB"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Owner">
            <select
              value={form.ownerId}
              onChange={(e) => {
                const ownerId = e.target.value;
                set("ownerId", ownerId);
                set("owner", users.find((u) => u.id === ownerId)?.name || "");
              }}
            >
              {users?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Next follow-up">
            <input
              type="date"
              value={form.nextFollowUp}
              onChange={(e) => set("nextFollowUp", e.target.value)}
            />
          </FormField>
          <FormField label="Expected close">
            <input
              type="date"
              value={form.expectedClose}
              onChange={(e) => set("expectedClose", e.target.value)}
            />
          </FormField>
        </div>
        <FormField label="Address">
          <input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </FormField>
        <FormField label="Notes">
          <textarea
            rows="3"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </FormField>
        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" icon={Plus} disabled={saving}>
            {saving ? "Saving…" : "Create Lead"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function NewCustomerModal({ open, onClose, addCustomer, users }) {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    category: "Mid Market",
    owner: users?.[0]?.name || "",
    value: "",
    address: "",
    status: "Active",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (open) {
      setForm((prev) => ({
        ...prev,
        owner: users?.[0]?.name || prev.owner,
      }));
    }
  }, [open, users]);

  async function submit(e) {
    e.preventDefault();
    if (!form.name || !form.company || !form.email) return;
    setSaving(true);
    await addCustomer({
      ...form,
      value: Number(form.value) || 0,
    });
    setSaving(false);
    onClose();
  }
  return (
    <Modal open={open} title="Add Customer" onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <div className="form-grid">
          <FormField label="Name">
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </FormField>
          <FormField label="Company">
            <input
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              required
            />
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
            />
          </FormField>
          <FormField label="Phone">
            <input
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </FormField>
          <FormField label="Category">
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {["Strategic", "Enterprise", "Mid Market", "SMB"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Value (₹)">
            <input
              type="number"
              value={form.value}
              onChange={(e) => set("value", e.target.value)}
            />
          </FormField>
          <FormField label="Status">
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              {["Active", "Renewal", "At Risk", "Inactive"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Address">
            <input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </FormField>
          <FormField label="Owner">
            <select
              value={form.owner}
              onChange={(e) => set("owner", e.target.value)}
            >
              {users?.map((u) => (
                <option key={u.id}>{u.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Notes">
            <textarea
              rows="2"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </FormField>
        </div>
        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" icon={Plus} disabled={saving}>
            {saving ? "Saving…" : "Add Customer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function NewTaskModal({ open, onClose, addTask, users }) {
  const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
  const [form, setForm] = useState({
    title: "",
    relatedTo: "",
    assignee: users?.[0]?.name || "",
    type: "Follow-up",
    dueDate: tomorrow,
    priority: "Medium",
    status: "Open",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (open) {
      setForm((prev) => ({
        ...prev,
        assignee: users?.[0]?.name || prev.assignee,
      }));
    }
  }, [open, users]);

  async function submit(e) {
    e.preventDefault();
    if (!form.title || !form.assignee) return;
    setSaving(true);
    await addTask(form);
    setSaving(false);
    onClose();
  }
  return (
    <Modal open={open} title="Create Task" onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <div className="form-grid">
          <FormField label="Title">
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
            />
          </FormField>
          <FormField label="Related To">
            <input
              value={form.relatedTo}
              onChange={(e) => set("relatedTo", e.target.value)}
            />
          </FormField>
          <FormField label="Type">
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
            >
              {["Follow-up", "Meeting", "Proposal", "Support", "Call"].map(
                (t) => (
                  <option key={t}>{t}</option>
                ),
              )}
            </select>
          </FormField>
          <FormField label="Priority">
            <select
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
            >
              {["High", "Medium", "Low"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Assignee">
            <select
              value={form.assignee}
              onChange={(e) => set("assignee", e.target.value)}
            >
              {users?.map((u) => (
                <option key={u.id}>{u.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Due Date">
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
            />
          </FormField>
        </div>
        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" icon={Plus} disabled={saving}>
            {saving ? "Saving…" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function NewCampaignModal({ open, onClose, addCampaign, users }) {
  const [form, setForm] = useState(initialCampaignForm(users));
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (open) {
      setForm(initialCampaignForm(users));
    }
  }, [open, users]);

  function resetForm() {
    setForm(initialCampaignForm(users));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    await addCampaign({
      name: form.name,
      type: form.type,
      owner: form.owner || users?.[0]?.name || "",
      status: form.status,
      budget: Number(form.budget || 0),
      expectedRevenue: Number(form.expectedRevenue || 0),
      actualRevenue: Number(form.actualRevenue || 0),
      startDate: form.startDate,
      endDate: form.endDate,
      description: form.description,
    });
    setSaving(false);
    resetForm();
    onClose();
  }
  return (
    <Modal open={open} title="New Campaign" onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <div className="form-grid">
          <FormField label="Campaign Name">
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </FormField>
          <FormField label="Type">
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
            >
              {[
                "Email",
                "WhatsApp",
                "SMS",
                "Social Media",
                "Referral",
                "Event",
                "Cold Calling",
                "Other",
              ].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Status">
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              {["Draft", "Active", "Paused", "Completed", "Cancelled"].map(
                (status) => (
                  <option key={status}>{status}</option>
                ),
              )}
            </select>
          </FormField>
          <FormField label="Owner">
            <select
              value={form.owner}
              onChange={(e) => set("owner", e.target.value)}
            >
              {users?.map((u) => (
                <option key={u.id}>{u.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Budget">
            <input
              type="number"
              value={form.budget}
              onChange={(e) => set("budget", e.target.value)}
            />
          </FormField>
          <FormField label="Expected Revenue">
            <input
              type="number"
              value={form.expectedRevenue}
              onChange={(e) => set("expectedRevenue", e.target.value)}
            />
          </FormField>
          <FormField label="Actual Revenue">
            <input
              type="number"
              value={form.actualRevenue}
              onChange={(e) => set("actualRevenue", e.target.value)}
            />
          </FormField>
          <FormField label="Start Date">
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
            />
          </FormField>
          <FormField label="End Date">
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => set("endDate", e.target.value)}
            />
          </FormField>
        </div>
        <FormField label="Description">
          <textarea
            rows="3"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </FormField>
        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" icon={Megaphone} disabled={saving}>
            {saving ? "Launching…" : "Launch Campaign"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ───────────────────── Sub-widgets ───────────────────── */
function FunnelLegend({ data }) {
  return (
    <div className="funnel-legend">
      {data.map((d, i) => (
        <div key={d.name} className="funnel-legend-item">
          <span
            className="funnel-dot"
            style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
          />
          <span className="funnel-label">{d.name}</span>
          <strong className="funnel-count">{d.value}</strong>
        </div>
      ))}
    </div>
  );
}

function UpcomingFollowUps({ tasks }) {
  const upcoming = tasks
    .filter((t) => t.status !== "Completed")
    .sort((a, b) => dayjs(a.dueDate).diff(dayjs(b.dueDate)))
    .slice(0, 5);

  function dueLine(date) {
    const diff = dayjs(date).startOf("day").diff(dayjs().startOf("day"), "day");
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff < 0) return `${Math.abs(diff)}d overdue`;
    return dayjs(date).format("MMM D");
  }

  if (!upcoming.length) {
    return (
      <div className="empty-state-minimal">
        <p>✓ No upcoming follow-ups</p>
        <small>You're all caught up!</small>
      </div>
    );
  }

  return (
    <div className="followup-list">
      {upcoming.map((task) => (
        <div key={task.id} className="followup-row">
          <span
            className={`followup-due ${dayjs(task.dueDate).isBefore(dayjs(), "day") ? "overdue" : ""}`}
          >
            {dueLine(task.dueDate)}
          </span>
          <div className="followup-body">
            <strong>{task.title}</strong>
            <span>
              {task.relatedTo} {task.dueTime ? `(${task.dueTime})` : ""} ·{" "}
              {task.type}
            </span>
          </div>
          <Badge tone={PRIORITY_TONE[task.priority] || "warning"}>
            {PRIORITY_ICON[task.priority]} {task.priority}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function UserCard({ user }) {
  const initials = user.name
    ?.split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="user-profile-card">
      <div className="upc-avatar-wrap">
        <div className="upc-avatar">{initials}</div>
        <span className="upc-online-dot" />
      </div>
      <div className="upc-info">
        <strong>{user.name}</strong>
        <div className="upc-meta">
          <Badge
            tone={
              user.role === "Administrator"
                ? "danger"
                : user.role === "Manager"
                  ? "primary"
                  : "success"
            }
          >
            {user.role}
          </Badge>
          <span className="upc-online-label">🟢 Online</span>
        </div>
      </div>
      <div className="upc-score">
        <strong>{user.performance}%</strong>
        <small>Score</small>
      </div>
    </div>
  );
}

/* ───────────────────── Main dashboard ───────────────────── */
export default function DashboardPage() {
  const {
    metrics,
    analytics,
    activities,
    pipeline,
    tasks,
    leads,
    customers,
    campaigns,
    users,
    leadStatuses,
    addLead,
    addCustomer,
    addTask,
    addCampaign,
  } = useCrmData();
  const { user: currentUser } = useAuth();
  const [modal, setModal] = useState(null);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const liveFunnel = [
    {
      name: "New",
      value: leads.filter((l) =>
        ["New", "Contacted", "Requirement Analysis"].includes(l.status),
      ).length,
    },
    {
      name: "Proposal",
      value: leads.filter((l) =>
        ["Proposal Sent", "Negotiation"].includes(l.status),
      ).length,
    },
    {
      name: "Converted",
      value: leads.filter((l) => l.status === "Converted").length,
    },
  ];

  const displayUsers =
    users && users.length ? users : currentUser ? [currentUser] : [];

  return (
    <div className="page-stack">
      {/* Header + greeting */}
      <div className="dashboard-header">
        <PageHeader title="Dashboard" eyebrow="Command center" />
        <p className="dashboard-greeting">
          {greeting}, {currentUser?.name?.split(" ")[0] || "there"} 👋 — Here's
          what's happening today.
        </p>
      </div>

      {/* Quick actions */}
      <div className="quick-actions">
        {[
          {
            label: "Add Lead",
            color: "#8b5cf6",
            icon: <Target size={16} />,
            action: () => setModal("lead"),
          },
          {
            label: "Add Customer",
            color: "#06b6d4",
            icon: <UserCheck size={16} />,
            action: () => setModal("customer"),
          },
          {
            label: "Create Task",
            color: "#f97316",
            icon: <ClipboardList size={16} />,
            action: () => setModal("task"),
          },
          {
            label: "New Campaign",
            color: "#ef4444",
            icon: <Megaphone size={16} />,
            action: () => setModal("campaign"),
          },
        ].map(({ label, color, icon, action }) => (
          <button
            key={label}
            className="quick-action-btn"
            style={{ "--action-color": color }}
            onClick={action}
          >
            <span className="quick-action-icon">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Stat cards — live data */}
      <section className="stat-grid">
        <StatCard
          label="Customers"
          value={formatNumber(metrics.totalCustomers)}
          icon={ContactRound}
          tone="teal"
          detail="Active accounts"
        />
        <StatCard
          label="Active Leads"
          value={formatNumber(metrics.activeLeads)}
          icon={Target}
          tone="blue"
          detail={`${metrics.convertedLeads} converted`}
        />
        <StatCard
          label="Follow-ups"
          value={formatNumber(metrics.pendingFollowUps)}
          icon={CalendarClock}
          tone="amber"
          detail="Due and upcoming"
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(metrics.monthlyRevenue)}
          icon={BadgeIndianRupee}
          tone="coral"
          detail="Annual account value"
        />
      </section>

      {/* Revenue + Lead funnel */}
      <section className="dashboard-grid">
        <article className="surface chart-card wide">
          <div className="section-title">
            <h2>Revenue Trend</h2>
            <Badge tone="success">Target +22%</Badge>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={analytics.revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `${v / 100000}L`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#0f9f8f"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="Target"
                stroke="#ef6f6c"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </article>

        <article className="surface chart-card">
          <div className="section-title">
            <h2>Lead Funnel</h2>
            <Badge tone="primary">{leads.length} total</Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={liveFunnel}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={82}
                paddingAngle={4}
              >
                {liveFunnel.map((d, i) => (
                  <Cell
                    key={d.name}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <FunnelLegend data={liveFunnel} />
        </article>
      </section>

      {/* Upcoming follow-ups + Campaign Status Breakdown */}
      <section className="dashboard-grid">
        <article className="surface">
          <div className="section-title">
            <h2>Upcoming Follow-ups</h2>
            <CalendarClock size={18} />
          </div>
          <UpcomingFollowUps tasks={tasks} />
        </article>

        <article className="surface chart-card">
          <div className="section-title">
            <h2>Campaign Status Breakdown</h2>
            <Badge tone="violet">{campaigns.length} campaigns</Badge>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={analytics.campaignStatusData}
              margin={{ left: -20, right: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="value"
                name="Campaigns"
                fill="#3f6ad8"
                radius={[6, 6, 0, 0]}
              >
                {analytics.campaignStatusData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>

      {/* Pipeline */}
      <section className="dashboard-grid">
        <article className="surface full-width-widget">
          <div className="section-title">
            <h2>Pipeline</h2>
            <TrendingUp size={18} />
          </div>
          <div className="pipeline-summary">
            {pipeline.map((col) => (
              <div key={col.stage} className="pipeline-summary-card">
                <span className="pipeline-stage-name">{col.stage}</span>
                <strong>{formatCurrency(col.value)}</strong>
                <small>
                  {col.count ?? 0} deal{(col.count ?? 0) !== 1 ? "s" : ""}
                </small>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Team performance */}
      <section className="dashboard-grid">
        <article className="surface chart-card full-width-widget">
          <div className="section-title">
            <h2>Team Performance</h2>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={analytics.teamPerformance}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {analytics.teamPerformance.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>

      {/* Team left of Activity */}
      <section className="dashboard-grid">
        <article className="surface team-widget">
          <div className="section-title">
            <h2>Team</h2>
            <Users size={18} />
          </div>
          <div className="user-cards-list">
            {displayUsers.map((u) => (
              <UserCard key={u.id} user={u} />
            ))}
          </div>
        </article>

        <article className="surface">
          <div className="section-title">
            <h2>Activity</h2>
          </div>
          <div className="activity-list">
            {activities.map((a) => (
              <div key={a.id} className="activity-row">
                <span className={`activity-dot dot-${a.tone}`} />
                <div>
                  <strong>{a.label}</strong>
                  <span>{a.detail}</span>
                </div>
                <small>{a.time}</small>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Quick-action modals */}
      <NewLeadModal
        open={modal === "lead"}
        onClose={() => setModal(null)}
        addLead={addLead}
        users={users}
        leadStatuses={leadStatuses}
      />
      <NewCustomerModal
        open={modal === "customer"}
        onClose={() => setModal(null)}
        addCustomer={addCustomer}
        users={users}
      />
      <NewTaskModal
        open={modal === "task"}
        onClose={() => setModal(null)}
        addTask={addTask}
        users={users}
      />
      <NewCampaignModal
        open={modal === "campaign"}
        onClose={() => setModal(null)}
        addCampaign={addCampaign}
        users={users}
      />
    </div>
  );
}
