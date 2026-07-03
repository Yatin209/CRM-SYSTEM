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

/* ── helpers ─────────────────────────────────────── */
function dl(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
function toCSV(rows, columns) {
  if (!rows.length) return "";
  const cols = columns || Object.keys(rows[0]).map((key) => ({ key, header: key }));
  return [
    cols.map((c) => JSON.stringify(c.header)).join(","),
    ...rows.map((r) =>
      cols
        .map((c) => JSON.stringify((c.value ? c.value(r) : r[c.key]) ?? ""))
        .join(","),
    ),
  ].join("\n");
}

// Resolve a createdBy/updatedBy field (which may be a raw user id, an
// already-resolved name, or a populated user object) into a display name.
function resolveUserName(value, usersById) {
  if (!value) return "";
  if (typeof value === "object") return value.name || "";
  return usersById.get(String(value)) || value;
}

/* ── Notification panel ──────────────────────────── */
function NotifPanel({ tasks, onClose }) {
  const pending = tasks.filter((t) => t.status !== "Completed").slice(0, 6);
  return (
    <div className="notif-panel" role="dialog" aria-label="Notifications">
      <div className="notif-header">
        <strong>Notifications</strong>
        <button className="icon-button" onClick={onClose} aria-label="Close">
          <X size={15} />
        </button>
      </div>
      {pending.length === 0 ? (
        <p className="notif-empty">All caught up 🎉</p>
      ) : (
        <ul className="notif-list">
          {pending.map((t) => (
            <li key={t.id} className="notif-item">
              <span
                className={`notif-dot p-${(t.priority || "Medium").toLowerCase()}`}
              />
              <div>
                <strong>{t.title}</strong>
                <span>
                  {t.relatedTo} · {t.dueDate}
                </span>
              </div>
              <Badge
                tone={
                  t.priority === "High"
                    ? "danger"
                    : t.priority === "Low"
                      ? "success"
                      : "warning"
                }
              >
                {t.priority}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Global search overlay ───────────────────────── */
function GlobalSearch({ onClose }) {
  const navigate = useNavigate();
  const {
    leads = [],
    customers = [],
    tasks = [],
    campaigns = [],
    users = [],
    communications = [],
  } = useCrmData();
  const [q, setQ] = useState("");
  const ref = useRef(null);
  useEffect(() => ref.current?.focus(), []);

  const needle = q.toLowerCase();

  const results =
    q.length > 1
      ? [
          ...leads
            .filter((l) =>
              `${l.name} ${l.company}`.toLowerCase().includes(needle),
            )
            .slice(0, 3)
            .map((l) => ({
              type: "Lead",
              label: l.name,
              sub: l.company,
              path: "/leads",
            })),
          ...customers
            .filter((c) =>
              `${c.name} ${c.company}`.toLowerCase().includes(needle),
            )
            .slice(0, 3)
            .map((c) => ({
              type: "Customer",
              label: c.company,
              sub: c.name,
              path: "/customers",
            })),
          ...tasks
            .filter((t) => t.title.toLowerCase().includes(needle))
            .slice(0, 2)
            .map((t) => ({
              type: "Task",
              label: t.title,
              sub: t.relatedTo,
              path: "/tasks",
            })),
          ...campaigns
            .filter((c) => (c.name || "").toLowerCase().includes(needle))
            .slice(0, 2)
            .map((c) => ({
              type: "Campaign",
              label: c.name,
              sub: c.status,
              path: "/campaigns",
            })),
          ...users
            .filter((u) =>
              `${u.name} ${u.email}`.toLowerCase().includes(needle),
            )
            .slice(0, 2)
            .map((u) => ({
              type: "User",
              label: u.name,
              sub: u.role,
              path: "/users",
            })),
          ...communications
            .filter((c) =>
              `${c.subject || ""} ${c.linkedTo || ""}`
                .toLowerCase()
                .includes(needle),
            )
            .slice(0, 2)
            .map((c) => ({
              type: "Communication",
              label: c.subject || c.type,
              sub: c.linkedTo,
              path: "/communications",
            })),
        ]
      : [];

  return (
    <div className="gs-overlay" onMouseDown={onClose}>
      <div className="gs-panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="gs-input-row">
          <Search size={17} />
          <input
            ref={ref}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search leads, customers, tasks, users, campaigns…"
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter" && results[0]) {
                navigate(results[0].path);
                onClose();
              }
            }}
          />
          <button className="icon-toggle" onClick={onClose}>
            <X size={15} />
          </button>
        </div>
        {results.length > 0 && (
          <ul className="gs-results">
            {results.map((r, i) => (
              <li
                key={i}
                onClick={() => {
                  navigate(r.path);
                  onClose();
                }}
              >
                <Badge
                  tone={
                    r.type === "Lead"
                      ? "primary"
                      : r.type === "Customer"
                        ? "success"
                        : r.type === "Campaign"
                          ? "info"
                          : r.type === "User"
                            ? "neutral"
                            : "warning"
                  }
                >
                  {r.type}
                </Badge>
                <div>
                  <strong>{r.label}</strong>
                  <span>{r.sub}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        {q.length > 1 && results.length === 0 && (
          <p className="gs-empty">No results for "{q}"</p>
        )}
        <div className="gs-hint">
          <kbd>↵</kbd> to open &nbsp; <kbd>Esc</kbd> to close
        </div>
      </div>
    </div>
  );
}

/* ── Main layout ─────────────────────────────────── */
export default function AppLayout() {
  const { user, logout } = useAuth();
  const { tasks = [], leads = [], customers = [], users: usersForExport = [] } = useCrmData();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const notifRef = useRef(null);
  const exportRef = useRef(null);

  const pendingCount = tasks.filter((t) => t.status !== "Completed").length;

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

  // Keyboard shortcut for search
  useEffect(() => {
    function h(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  function doExport(kind) {
    setExportOpen(false);
    const ts = new Date().toISOString().slice(0, 10);
    const usersById = new Map(
      (usersForExport || []).map((u) => [String(u.id), u.name]),
    );
    const auditCols = [
      { key: "createdBy", header: "createdBy", value: (r) => resolveUserName(r.createdBy, usersById) },
      { key: "updatedBy", header: "updatedBy", value: (r) => resolveUserName(r.updatedBy, usersById) },
    ];

    if (kind === "leads") {
      const columns = [
        { key: "id", header: "id" },
        { key: "name", header: "name" },
        { key: "company", header: "company" },
        { key: "email", header: "email" },
        { key: "phone", header: "phone" },
        { key: "source", header: "source" },
        { key: "status", header: "status" },
        { key: "stage", header: "stage" },
        { key: "category", header: "category" },
        { key: "address", header: "address" },
        { key: "value", header: "value", value: (r) => Number(r.value) || 0 },
        { key: "owner", header: "owner" },
        { key: "nextFollowUp", header: "nextFollowUp" },
        { key: "expectedClose", header: "expectedClose" },
        { key: "notes", header: "notes" },
        ...auditCols,
        { key: "createdAt", header: "createdAt" },
        { key: "updatedAt", header: "updatedAt" },
      ];
      dl(new Blob([toCSV(leads, columns)], { type: "text/csv" }), `nexacrm-leads-${ts}.csv`);
    }
    if (kind === "customers") {
      const columns = [
        { key: "id", header: "id" },
        { key: "name", header: "name" },
        { key: "company", header: "company" },
        { key: "email", header: "email" },
        { key: "phone", header: "phone" },
        { key: "address", header: "address" },
        { key: "category", header: "category" },
        { key: "owner", header: "owner" },
        { key: "status", header: "status" },
        { key: "value", header: "value", value: (r) => Number(r.value) || 0 },
        { key: "notes", header: "notes" },
        ...auditCols,
        { key: "createdAt", header: "createdAt" },
        { key: "updatedAt", header: "updatedAt" },
      ];
      dl(new Blob([toCSV(customers, columns)], { type: "text/csv" }), `nexacrm-customers-${ts}.csv`);
    }
    if (kind === "tasks") {
      const columns = [
        { key: "id", header: "id" },
        { key: "title", header: "title" },
        { key: "type", header: "type" },
        { key: "relatedTo", header: "relatedTo" },
        { key: "dueDate", header: "dueDate" },
        { key: "status", header: "status" },
        { key: "priority", header: "priority" },
        { key: "assignee", header: "assignee" },
        ...auditCols,
        { key: "createdAt", header: "createdAt" },
        { key: "updatedAt", header: "updatedAt" },
      ];
      dl(new Blob([toCSV(tasks, columns)], { type: "text/csv" }), `nexacrm-tasks-${ts}.csv`);
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
            <span className="sp-online-dot" />
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

          {/* Center: search trigger */}
          <div className="topbar-center">
            <button
              className="topbar-search-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search size={15} />
              <span>Search leads, customers, tasks, users, campaigns…</span>
            </button>
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
                {pendingCount > 0 && (
                  <span className="notification-badge">{pendingCount}</span>
                )}
              </button>
              {notifOpen && (
                <NotifPanel tasks={tasks} onClose={() => setNotifOpen(false)} />
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

      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
