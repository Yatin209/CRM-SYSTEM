import {
  BarChart3,
  Bell,
  CheckSquare,
  Download,
  FileSpreadsheet,
  FileText,
  LogOut,
  Menu,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Avatar from "../components/common/Avatar.jsx";
import Badge from "../components/common/Badge.jsx";
import ThemeToggle from "../components/common/ThemeToggle.jsx";
import { navigationGroups, navigationItems } from "../config/navigation.js";
import { canAccess, ROLE_COLORS } from "../config/roles.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCrmData } from "../context/CrmDataContext.jsx";
import { downloadCsv } from "../utils/csvExport.js";
import { formatDate } from "../utils/formatters.js";

dayjs.extend(relativeTime);

/* ── helpers ─────────────────────────────────────── */
function dl(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ── Notification panel ──────────────────────────── */
function NotifPanel({ notifications, tasks, markNotificationRead, markAllNotificationsRead, onClose }) {
  const unreadNotifications = notifications.filter((n) => !n.read);
  const pendingTasks = tasks.filter((t) => t.status !== "Completed");
  
  // Combine notifications and tasks, sort by date
  const allItems = [
    ...notifications.map((n) => ({
      ...n,
      itemType: "notification",
      sortDate: new Date(n.createdAt || Date.now()),
    })),
    ...pendingTasks.map((t) => ({
      ...t,
      itemType: "task",
      sortDate: new Date(t.dueDate || Date.now()),
    })),
  ].sort((a, b) => b.sortDate - a.sortDate);

  const displayItems = allItems.slice(0, 10);
  const totalUnread = unreadNotifications.length + pendingTasks.length;

  const getNotificationTone = (type) => {
    switch (type) {
      case "Assignment":
        return "primary";
      case "Follow-up":
        return "warning";
      case "Deal":
        return "success";
      case "Ticket":
        return "danger";
      default:
        return "info";
    }
  };

  const getTaskTone = (priority) => {
    switch (priority) {
      case "High":
        return "danger";
      case "Low":
        return "success";
      default:
        return "warning";
    }
  };

  const handleMarkAsRead = (id, e) => {
    e.stopPropagation();
    markNotificationRead(id);
  };

  return (
    <div className="notif-panel" role="dialog" aria-label="Notifications">
      <div className="notif-header">
        <strong>Notifications</strong>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {unreadNotifications.length > 0 && (
            <button
              className="text-button"
              onClick={markAllNotificationsRead}
              style={{ fontSize: "12px", padding: "4px 8px" }}
            >
              Mark all read
            </button>
          )}
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>
        </div>
      </div>
      {displayItems.length === 0 ? (
        <p className="notif-empty">All caught up 🎉</p>
      ) : (
        <ul className="notif-list">
          {displayItems.map((item) => {
            if (item.itemType === "notification") {
              return (
                <li
                  key={`notif-${item.id || item._id}`}
                  className="notif-item"
                  style={{
                    opacity: item.read ? 0.6 : 1,
                    backgroundColor: item.read ? "transparent" : "var(--color-bg-subtle)",
                  }}
                >
                  <span className={`notif-dot`} style={{ 
                    backgroundColor: item.read ? "var(--color-border)" : "var(--color-primary)" 
                  }} />
                  <div style={{ flex: 1 }}>
                    <strong>{item.title}</strong>
                    <span>
                      {item.message}
                      {item.createdAt && ` · ${dayjs(item.createdAt).fromNow()}`}
                    </span>
                  </div>
                  <Badge tone={getNotificationTone(item.type)}>
                    {item.type}
                  </Badge>
                </li>
              );
            } else {
              // Task item
              return (
                <li
                  key={`task-${item.id || item._id}`}
                  className="notif-item"
                >
                  <span
                    className={`notif-dot p-${(item.priority || "Medium").toLowerCase()}`}
                  />
                  <div style={{ flex: 1 }}>
                    <strong>{item.title}</strong>
                    <span>
                      {item.relatedTo} · Due: {formatDate(item.dueDate)}
                    </span>
                  </div>
                  <Badge tone={getTaskTone(item.priority)}>
                    {item.priority}
                  </Badge>
                </li>
              );
            }
          })}
        </ul>
      )}
    </div>
  );
}

/* ── Global search (inline dropdown, not a full-page overlay) ───── */
function GlobalSearch() {
  const navigate = useNavigate();
  const {
    leads = [],
    customers = [],
    tasks = [],
    campaigns = [],
    users = [],
  } = useCrmData();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const needle = q.toLowerCase();

  const results =
    q.length > 1
      ? [
          ...leads
            .filter((l) =>
              `${l.name} ${l.company} ${l.email} ${l.owner}`
                .toLowerCase()
                .includes(needle),
            )
            .slice(0, 4)
            .map((l) => ({
              type: "Lead",
              label: l.name,
              sub: l.company,
              path: "/leads",
            })),
          ...customers
            .filter((c) =>
              `${c.name} ${c.company} ${c.email} ${c.owner}`
                .toLowerCase()
                .includes(needle),
            )
            .slice(0, 4)
            .map((c) => ({
              type: "Customer",
              label: c.company,
              sub: c.name,
              path: "/customers",
            })),
          ...campaigns
            .filter((c) => `${c.name} ${c.type}`.toLowerCase().includes(needle))
            .slice(0, 3)
            .map((c) => ({
              type: "Campaign",
              label: c.name,
              sub: c.type,
              path: "/campaigns",
            })),
          ...tasks
            .filter((t) =>
              `${t.title} ${t.relatedTo || ""}`.toLowerCase().includes(needle),
            )
            .slice(0, 3)
            .map((t) => ({
              type: "Task",
              label: t.title,
              sub: t.relatedTo,
              path: "/tasks",
            })),
          ...users
            .filter((u) => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(needle))
            .slice(0, 3)
            .map((u) => ({
              type: "User",
              label: u.name,
              sub: u.role,
              path: "/users",
            })),
          ...navigationItems
            .filter((item) => !item.hidden && item.label.toLowerCase().includes(needle))
            .map((item) => ({
              type: "Page",
              label: item.label,
              sub: "Go to page",
              path: item.path,
            })),
        ]
      : [];

  const TONE_BY_TYPE = {
    Lead: "primary",
    Customer: "success",
    Campaign: "violet",
    Task: "warning",
    User: "info",
    Page: "neutral",
  };

  function goTo(path) {
    navigate(path);
    setQ("");
    setOpen(false);
  }

  return (
    <div className="gs-inline" ref={wrapRef}>
      <div className="gs-inline-input-row">
        <Search size={15} />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search leads, customers, campaigns, tasks…"
        />
        {q && (
          <button
            type="button"
            className="icon-toggle"
            onClick={() => {
              setQ("");
              setOpen(false);
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>
      {open && q.length > 1 && (
        <ul className="gs-dropdown">
          {results.length > 0 ? (
            results.map((r, i) => (
              <li key={i} onClick={() => goTo(r.path)}>
                <Badge tone={TONE_BY_TYPE[r.type] || "neutral"}>{r.type}</Badge>
                <div>
                  <strong>{r.label}</strong>
                  <span>{r.sub}</span>
                </div>
              </li>
            ))
          ) : (
            <li className="gs-dropdown-empty">No results for &quot;{q}&quot;</li>
          )}
        </ul>
      )}
    </div>
  );
}

/* ── Main layout ─────────────────────────────────── */
export default function AppLayout() {
  const { user, logout } = useAuth();
  const { 
    tasks = [], 
    leads = [], 
    customers = [], 
    users = [],
    notifications = [],
    markNotificationRead,
    markAllNotificationsRead,
  } = useCrmData();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const notifRef = useRef(null);
  const exportRef = useRef(null);

  const pendingCount = tasks.filter((t) => t.status !== "Completed").length;
  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const totalNotificationCount = unreadNotifCount + pendingCount;

  const visibleItems = navigationItems.filter(
    (i) => !i.hidden && canAccess(user.role, i.id),
  );
  const groupedItems = navigationGroups.reduce((acc, g) => {
    const items = visibleItems.filter((i) => i.group === g);
    if (items.length) acc.push({ group: g, items });
    return acc;
  }, []);

  const pageLabel =
    navigationItems.find((i) => i.path === location.pathname)?.label ||
    "Dashboard";

  // Close dropdowns on outside click
  useEffect(() => {
    function h(e) {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target))
        setExportOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // On mobile auto-close sidebar on navigation
  useEffect(() => {
    if (window.innerWidth <= 860) setSidebarOpen(false);
  }, [location.pathname]);

  function doExport(kind) {
    setExportOpen(false);
    const ts = new Date().toISOString().slice(0, 10);
    if (kind === "leads") {
      downloadCsv(`nexacrm-leads-${ts}.csv`, leads, users);
    }
    if (kind === "customers") {
      downloadCsv(`nexacrm-customers-${ts}.csv`, customers, users);
    }
    if (kind === "tasks") {
      downloadCsv(`nexacrm-tasks-${ts}.csv`, tasks, users);
    }
  }

  return (
    <div className={`app-shell ${sidebarOpen ? "sb-open" : "sb-closed"}`}>
      {/* ── Sidebar ─────────────────────────────── */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">
            <Sparkles size={20} />
          </span>
          {sidebarOpen && (
            <div>
              <strong>NexaCRM</strong>
              <small>CRM Platform</small>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {groupedItems.map(({ group, items }) => (
            <div key={group}>
              {sidebarOpen && <div className="nav-group-label">{group}</div>}
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    title={item.label}
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <Icon size={20} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-profile">
          <div className="sp-avatar-wrap">
            <Avatar name={user.name} />
          </div>
          {sidebarOpen && (
            <div className="sp-info">
              <strong>{user.name}</strong>
              <Badge tone={ROLE_COLORS[user.role]}>{user.role}</Badge>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main shell ──────────────────────────── */}
      <div className="main-shell">
        <header className="topbar">
          {/* Left: toggle + page title */}
          <div className="topbar-left">
            <button
              className="icon-button"
              type="button"
              onClick={() => setSidebarOpen((p) => !p)}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <Menu size={20} />
            </button>
            <div>
              <span className="topbar-label">NexaCRM</span>
              <strong>{pageLabel}</strong>
            </div>
          </div>

          {/* Center: inline search */}
          <div className="topbar-center">
            <GlobalSearch />
          </div>

          {/* Right: actions */}
          <div className="topbar-actions">
            <Link to="/tasks" className="topbar-nav-link" title="Tasks">
              <CheckSquare size={17} />
              <span className="tnl-label">Tasks</span>
              {pendingCount > 0 && (
                <span className="tnl-badge">{pendingCount}</span>
              )}
            </Link>

            <Link to="/reports" className="topbar-nav-link" title="Reports">
              <BarChart3 size={17} />
              <span className="tnl-label">Reports</span>
            </Link>

            {/* Export */}
            <div className="dd-wrap" ref={exportRef}>
              <button
                className="icon-button"
                onClick={() => setExportOpen((p) => !p)}
                title="Export data"
              >
                <Download size={18} />
              </button>
              {exportOpen && (
                <div className="dd-menu">
                  <button onClick={() => doExport("leads")}>
                    <FileSpreadsheet size={14} />
                    Leads CSV
                  </button>
                  <button onClick={() => doExport("customers")}>
                    <FileSpreadsheet size={14} />
                    Customers CSV
                  </button>
                  <button onClick={() => doExport("tasks")}>
                    <FileText size={14} />
                    Tasks CSV
                  </button>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="dd-wrap" ref={notifRef}>
              <button
                className="icon-button notification-bell"
                onClick={() => setNotifOpen((p) => !p)}
                title="Notifications"
              >
                <Bell size={20} />
                {totalNotificationCount > 0 && (
                  <span className="notification-badge">{totalNotificationCount}</span>
                )}
              </button>
              {notifOpen && (
                <NotifPanel 
                  notifications={notifications}
                  tasks={tasks}
                  markNotificationRead={markNotificationRead}
                  markAllNotificationsRead={markAllNotificationsRead}
                  onClose={() => setNotifOpen(false)} 
                />
              )}
            </div>

            <ThemeToggle />

            <button
              className="icon-button logout-btn"
              onClick={logout}
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="content-shell">
          <Outlet />
        </main>
      </div>
    

    </div>
  );
}