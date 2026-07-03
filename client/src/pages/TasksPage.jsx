import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { Check, Clock3, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Badge from "../components/common/Badge.jsx";
import Button from "../components/common/Button.jsx";
import DataTable from "../components/common/DataTable.jsx";
import FormField from "../components/common/FormField.jsx";
import Modal from "../components/common/Modal.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import SearchInput from "../components/common/SearchInput.jsx";
import { useCrmData } from "../context/CrmDataContext.jsx";
import { priorities } from "../data/mockData.js";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { statusTone } from "../utils/formatters.js";

const schema = z.object({
  title: z.string().min(3, "Task title is required"),
  relatedTo: z.string().min(2, "Related record is required"),
  assignee: z.string().min(2, "Assignee is required"),
  type: z.string(),
  dueDate: z.string(),
  priority: z.string()
});

function TasksPage() {
  const { tasks, users, addTask, updateTask } = useCrmData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "Follow-up",
      priority: "Medium",
      assignee: "Rohan Iyer",
      dueDate: new Date().toISOString().slice(0, 10)
    }
  });

  const filtered = useMemo(() => {
    const needle = debouncedQuery.toLowerCase();
    return tasks.filter((task) => {
      const matchesQuery = [task.title, task.relatedTo, task.assignee, task.type].join(" ").toLowerCase().includes(needle);
      const matchesStatus = status === "All" || task.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [debouncedQuery, status, tasks]);

  function onSubmit(values) {
    addTask(values);
    reset();
    setOpen(false);
  }

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
    {
      key: "dueDate",
      header: "Due Date",
      render: (task) => dayjs(task.dueDate).format("YYYY-MM-DD"),
    },
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

      <Modal open={open} title="Add task" onClose={() => setOpen(false)}>
        <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <FormField label="Task title" error={errors.title}>
              <input {...register("title")} />
            </FormField>
            <FormField label="Related to" error={errors.relatedTo}>
              <input {...register("relatedTo")} />
            </FormField>
            <FormField label="Type" error={errors.type}>
              <select {...register("type")}>
                {["Follow-up", "Meeting", "Proposal", "Support", "Call"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Assignee" error={errors.assignee}>
              <select {...register("assignee")}>
                {users.map((user) => (
                  <option key={user.id}>{user.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Due date" error={errors.dueDate}>
              <input type="date" {...register("dueDate")} />
            </FormField>
            <FormField label="Priority" error={errors.priority}>
              <select {...register("priority")}>
                {priorities.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="modal-actions">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" icon={Plus}>
              Save Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default TasksPage;
