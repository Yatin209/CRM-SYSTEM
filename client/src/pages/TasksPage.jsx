import { Edit2, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../components/common/Badge.jsx";
import Button from "../components/common/Button.jsx";
import DataTable from "../components/common/DataTable.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import SearchInput from "../components/common/SearchInput.jsx";
import ConfirmPopover from "../components/common/ConfirmPopover.jsx";
import TaskFormModal from "../components/forms/TaskFormModal.jsx";
import { useCrmData } from "../context/CrmDataContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { statusTone, formatDate } from "../utils/formatters.js";

function TasksPage() {
  const { tasks, updateTask, deleteTask } = useCrmData();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const debouncedQuery = useDebouncedValue(query);

  const isAdmin = user?.role === "Administrator";

  const filtered = useMemo(() => {
    const needle = debouncedQuery.toLowerCase();
    return tasks.filter((task) => {
      const matchesQuery = [task.title, task.relatedTo, task.assignee, task.type].join(" ").toLowerCase().includes(needle);
      const matchesStatus = status === "All" || task.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [debouncedQuery, status, tasks]);

  const handleStatusChange = (task, newStatus) => {
    updateTask(task.id, { status: newStatus });
  };

  const handleEdit = (task) => {
    setEditingTask(task);
  };

  const handleDelete = async (taskId) => {
    await deleteTask(taskId);
  };

  const isTaskAssignee = (task) => {
    return task.assignee === user?.name || task.assignee === user?.email;
  };

  // Define columns dynamically based on user role
  const columns = useMemo(() => {
    const baseColumns = [
      {
        key: "title",
        header: "Task",
        render: (task) => (
          <div className="cell-title">
            <strong>{task.title}</strong>
            <span>{task.relatedTo}</span>
          </div>
        )
      },
      { key: "type", header: "Type" },
      { key: "assignee", header: "Assignee" },
      { key: "dueDate", header: "Due Date", render: (task) => formatDate(task.dueDate) },
      { key: "priority", header: "Priority", render: (task) => <Badge tone={statusTone(task.priority)}>{task.priority}</Badge> },
      { 
        key: "status", 
        header: "Status", 
        render: (task) => {
          const canChangeStatus = isAdmin || isTaskAssignee(task);
          
          if (!canChangeStatus) {
            return <Badge tone={statusTone(task.status)}>{task.status}</Badge>;
          }

          return (
            <select
              className="form-select compact-select"
              value={task.status}
              onChange={(e) => handleStatusChange(task, e.target.value)}
              style={{ minWidth: "140px" }}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          );
        }
      },
    ];

    // Add Actions column only for admins
    if (isAdmin) {
      baseColumns.push({
        key: "actions",
        header: "Actions",
        render: (task) => (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button
              size="sm"
              variant="ghost"
              icon={Edit2}
              onClick={() => handleEdit(task)}
            >
              Edit
            </Button>
            <ConfirmPopover
              message="Are you sure you want to delete this task? This action cannot be undone."
              confirmLabel="Delete"
              onConfirm={() => handleDelete(task.id)}
            >
              {(open) => (
                <Button
                  size="sm"
                  variant="danger"
                  icon={Trash2}
                  onClick={open}
                >
                  Delete
                </Button>
              )}
            </ConfirmPopover>
          </div>
        )
      });
    }

    return baseColumns;
  }, [isAdmin]);

  return (
    <div className="page-stack">
      <PageHeader
        title="Tasks"
        eyebrow="Follow-ups and activity"
        actions={
          isAdmin && (
            <Button icon={Plus} onClick={() => setOpen(true)}>
              Add Task
            </Button>
          )
        }
      />

      <section className="surface">
        <div className="toolbar">
          <SearchInput value={query} onChange={setQuery} placeholder="Search tasks" />
          <select className="form-select compact-select" value={status} onChange={(event) => setStatus(event.target.value)}>
            {["All", "Pending", "In Progress", "Completed"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <DataTable columns={columns} data={filtered} emptyTitle="No tasks found" />
      </section>

      <TaskFormModal 
        open={open || editingTask !== null} 
        onClose={() => {
          setOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
      />
    </div>
  );
}

export default TasksPage;
