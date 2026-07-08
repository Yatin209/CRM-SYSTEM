import { Check, Clock3, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../components/common/Badge.jsx";
import Button from "../components/common/Button.jsx";
import DataTable from "../components/common/DataTable.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import SearchInput from "../components/common/SearchInput.jsx";
import TaskFormModal from "../components/forms/TaskFormModal.jsx";
import { useCrmData } from "../context/CrmDataContext.jsx";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { statusTone, formatPlainDate } from "../utils/formatters.js";

function TasksPage() {
  const { tasks, updateTask } = useCrmData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query);

  const filtered = useMemo(() => {
    const needle = debouncedQuery.toLowerCase();
    return tasks.filter((task) => {
      const matchesQuery = [task.title, task.relatedTo, task.assignee, task.type].join(" ").toLowerCase().includes(needle);
      const matchesStatus = status === "All" || task.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [debouncedQuery, status, tasks]);

  const columns = [
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
    { key: "dueDate", header: "Due Date", render: (task) => formatPlainDate(task.dueDate) },
    { key: "priority", header: "Priority", render: (task) => <Badge tone={statusTone(task.priority)}>{task.priority}</Badge> },
    { key: "status", header: "Status", render: (task) => <Badge tone={statusTone(task.status)}>{task.status}</Badge> },
    {
      key: "actions",
      header: "Actions",
      render: (task) => (
        <Button
          size="sm"
          variant={task.status === "Completed" ? "ghost" : "success"}
          icon={task.status === "Completed" ? Clock3 : Check}
          onClick={() => updateTask(task.id, { status: task.status === "Completed" ? "Open" : "Completed" })}
        >
          {task.status === "Completed" ? "Reopen" : "Done"}
        </Button>
      )
    }
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title="Tasks"
        eyebrow="Follow-ups and activity"
        actions={
          <Button icon={Plus} onClick={() => setOpen(true)}>
            Add Task
          </Button>
        }
      />

      <section className="surface">
        <div className="toolbar">
          <SearchInput value={query} onChange={setQuery} placeholder="Search tasks" />
          <select className="form-select compact-select" value={status} onChange={(event) => setStatus(event.target.value)}>
            {["All", "Open", "In Progress", "Completed"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <DataTable columns={columns} data={filtered} emptyTitle="No tasks found" />
      </section>

      <TaskFormModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export default TasksPage;
