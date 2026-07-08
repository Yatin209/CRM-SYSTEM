import { Pencil, ShieldCheck, UserPlus, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import AddUserModal from "../components/common/AddUserModal.jsx";
import Avatar from "../components/common/Avatar.jsx";
import Badge from "../components/common/Badge.jsx";
import Button from "../components/common/Button.jsx";
import DataTable from "../components/common/DataTable.jsx";
import FormField from "../components/common/FormField.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import { navigationItems } from "../config/navigation.js";
import { PERMISSIONS, ROLE_COLORS, ROLES } from "../config/roles.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCrmData } from "../context/CrmDataContext.jsx";

const ALL_ROLES = Object.values(ROLES);

function EditUserModal({ user, onClose, onSubmit }) {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      role: user.role,
      region: user.region,
      status: user.status,
    },
  });

  async function submit(data) {
    setIsLoading(true);
    try {
      await onSubmit(user.id, data);
      onClose();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="modal-backdrop-nexa">
      <div className="modal-panel">
        <div className="modal-head">
          <h2>Edit {user.name}</h2>
          <button type="button" onClick={onClose} className="icon-button" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit(submit)} className="modal-form">
          <FormField label="Role">
            <select {...register("role")} disabled={isLoading}>
              {ALL_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Region">
            <input {...register("region")} disabled={isLoading} />
          </FormField>
          <FormField label="Status">
            <select {...register("status")} disabled={isLoading}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </FormField>
          <div className="modal-actions">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UsersPage() {
  const { users, addUser, updateUser } = useCrmData();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === ROLES.ADMIN;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const modules = navigationItems.filter((item) => !item.hidden);

  const handleAddUser = useCallback(
    async (userData) => {
      setIsLoading(true);
      try {
        await addUser(userData);
      } finally {
        setIsLoading(false);
      }
    },
    [addUser],
  );

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
      render: (user) => <Badge tone={ROLE_COLORS[user.role]}>{user.role}</Badge>,
    },
    { key: "region", header: "Region" },
    {
      key: "status",
      header: "Status",
      render: (user) => <Badge tone="success">{user.status}</Badge>,
    },
    ...(isAdmin
      ? [
          {
            key: "actions",
            header: "Actions",
            render: (user) => (
              <Button
                size="sm"
                variant="ghost"
                icon={Pencil}
                onClick={() => setEditingUser(user)}
              >
                Edit
              </Button>
            ),
          },
        ]
      : []),
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
          {ALL_ROLES.map((role) => (
            <article key={role}>
              <strong>{role}</strong>
              <div>
                {modules.map((module) => (
                  <Badge
                    key={module.id}
                    tone={PERMISSIONS[role]?.includes(module.id) ? "success" : "neutral"}
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

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={updateUser}
        />
      )}
    </div>
  );
}

export default UsersPage;
