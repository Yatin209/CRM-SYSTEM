import dayjs from "dayjs";
import {
  BadgeIndianRupee,
  CalendarClock,
  ContactRound,
  Megaphone,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Badge from "../components/common/Badge.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import StatCard from "../components/common/StatCard.jsx";
import LeadFormModal from "../components/forms/LeadFormModal.jsx";
import CustomerFormModal from "../components/forms/CustomerFormModal.jsx";
import TaskFormModal from "../components/forms/TaskFormModal.jsx";
import CampaignFormModal from "../components/forms/CampaignFormModal.jsx";
import { useCrmData } from "../context/CrmDataContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  formatCurrency,
  formatNumber,
} from "../utils/formatters.js";

const CHART_COLORS = [
  "#0f9f8f",
  "#3f6ad8",
  "#f59e0b",
  "#ef6f6c",
  "#7c3aed",
  "#06b6d4",
  "#84cc16",
  "#64748b",
];
const PRIORITY_ICON = { High: "🔴", Medium: "🟠", Low: "🟢" };
const PRIORITY_TONE = { High: "danger", Medium: "warning", Low: "success" };

/* ───────────────────── Sub-widgets ───────────────────── */
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
        <small>You&apos;re all caught up!</small>
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
        </div>
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
    campaigns,
    users,
  } = useCrmData();
  const { user: currentUser } = useAuth();
  const [modal, setModal] = useState(null);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const displayUsers =
    users && users.length ? users : currentUser ? [currentUser] : [];

  return (
    <div className="page-stack">
      {/* Header + greeting */}
      <div className="dashboard-header">
        <PageHeader title="Dashboard" eyebrow="Command center" />
        <p className="dashboard-greeting">
          {greeting}, {currentUser?.name?.split(" ")[0] || "there"} 👋 — Here&apos;s
          what&apos;s happening today.
        </p>
      </div>

      {/* Quick actions — reuse the exact same forms/validations/APIs as
          the sidebar pages, so there's no divergent duplicate logic. */}
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
            <BarChart data={analytics.revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `${v / 100000}L`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="revenue" name="Revenue" fill="#0f9f8f" radius={[6, 6, 0, 0]} />
              <Bar dataKey="target" name="Target" fill="#ef6f6c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="surface chart-card">
          <div className="section-title">
            <h2>Lead Funnel</h2>
            <Badge tone="primary">{leads.length} total</Badge>
          </div>
          {/* Full lead lifecycle funnel, driven by live lead data. Every
              stage updates automatically as leads are created, updated,
              converted, deleted, or change status. */}
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={analytics.leadFunnel}
              layout="vertical"
              margin={{ left: 10, right: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" name="Leads" radius={[0, 6, 6, 0]}>
                {analytics.leadFunnel.map((d, i) => (
                  <Cell key={d.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>

      {/* Upcoming follow-ups + Campaign status breakdown */}
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
        <article className="surface">
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

        {/* Team + Activity */}
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
      </section>

      <section className="dashboard-grid single-col">
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

      {/* Quick-action modals — same shared components used by their
          respective sidebar pages. */}
      <LeadFormModal open={modal === "lead"} onClose={() => setModal(null)} />
      <CustomerFormModal
        open={modal === "customer"}
        onClose={() => setModal(null)}
      />
      <TaskFormModal open={modal === "task"} onClose={() => setModal(null)} />
      <CampaignFormModal
        open={modal === "campaign"}
        onClose={() => setModal(null)}
      />
    </div>
  );
}
