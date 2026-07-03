import { Pencil, ShieldCheck, UserPlus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import AddUserModal from "../components/common/AddUserModal.jsx";
import Avatar from "../components/common/Avatar.jsx";
import Badge from "../components/common/Badge.jsx";
import Button from "../components/common/Button.jsx";
import DataTable from "../components/common/DataTable.jsx";
import FormField from "../components/common/FormField.jsx";
import Modal from "../components/common/Modal.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import { navigationItems } from "../config/navigation.js";
import { PERMISSIONS, ROLE_COLORS, ROLES } from "../config/roles.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCrmData } from "../context/CrmDataContext.jsx";

function UsersPage() {
  const { users, addUser, updateUser } = useCrmData();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "Administrator";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "", region: "", status: "" });
  const modules = navigationItems.filter((item) => !item.hidden);

  // Unique roles only, so each role's permissions are listed once (no duplicates).
  const uniqueRoles = useMemo(() => Object.values(ROLES), []);

  const handleAddUser = useCallback(async (userData) => {
    setIsLoading(true);
    try {
      await addUser(userData);
    } finally {
      setIsLoading(false);
    }
  }, [addUser]);

  function openEdit(user) {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
      region: user.region || "",
      status: user.status || "Active",
    });
  }

  function closeEdit() {
    setEditingUser(null);
  }

  async function submitEdit(e) {
    e.preventDefault();
    if (!editingUser) return;
    await updateUser(editingUser.id, editForm);
    closeEdit();
  }

  const columns = [
    {
      key: "name",
      header: "User",
      render: (user) => (
        <div className="user-cell">
          <Avatar name={user.name} />
          <div className="cell-title">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user) => (
        <Badge tone={ROLE_COLORS[user.role]}>{user.role}</Badge>
      ),
    },
    { key: "region", header: "Region" },
    {
      key: "status",
      header: "Status",
      render: (user) => <Badge tone="success">{user.status}</Badge>,
    },
    {
      key: "performance",
      header: "Score",
      render: (user) => (
        <div className="health-meter">
          <span style={{ width: `${user.performance}%` }} />
          <strong>{user.performance}%</strong>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user) =>
        isAdmin ? (
          <div className="row-actions">
            <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openEdit(user)}>
              Edit
            </Button>
          </div>
        ) : (
          <span className="muted-text">—</span>
        ),
    },
  ];

  return (
    <div className="page-stack">
      <div className="page-header">
        <PageHeader title="Users" eyebrow="Roles and access" />
        <Button icon={UserPlus} onClick={() => setIsModalOpen(true)}>
          Add User
        </Button>
      </div>

      <section className="surface">
        <DataTable columns={columns} data={users} />
      </section>

      <section className="surface">
        <div className="section-title">
          <h2>Permission Matrix</h2>
          <ShieldCheck size={18} />
        </div>
        <div className="permission-grid">
          {uniqueRoles.map((role) => (
            <article key={role}>
              <strong>{role}</strong>
              <div>
                {modules.map((module) => (
                  <Badge
                    key={module.id}
                    tone={
                      PERMISSIONS[role]?.includes(module.id)
                        ? "success"
                        : "neutral"
                    }
                  >
                    {module.label}
                  </Badge>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddUser}
        isLoading={isLoading}
      />

      <Modal open={!!editingUser} title="Edit user" onClose={closeEdit}>
        <form className="modal-form" onSubmit={submitEdit}>
          <div className="form-grid">
            <FormField label="Name">
              <input
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </FormField>
            <FormField label="Email">
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </FormField>
            <FormField label="Role">
              <select
                value={editForm.role}
                onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
              >
                {Object.values(ROLES).map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Region">
              <input
                value={editForm.region}
                onChange={(e) => setEditForm((p) => ({ ...p, region: e.target.value }))}
              />
            </FormField>
            <FormField label="Status">
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
              >
                {["Active", "Inactive"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="modal-actions">
            <Button variant="ghost" onClick={closeEdit}>
              Cancel
            </Button>
            <Button type="submit" icon={Pencil}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default UsersPage;
