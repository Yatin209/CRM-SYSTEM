import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../common/Button.jsx";
import FormField from "../common/FormField.jsx";
import Modal from "../common/Modal.jsx";
import { useCrmData } from "../../context/CrmDataContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { priorities } from "../../data/mockData.js";

const schema = z.object({
  title: z.string().min(3, "Task title is required"),
  relatedTo: z.string().min(2, "Related record is required"),
  assignee: z.string().min(2, "Assignee is required"),
  type: z.string(),
  dueDate: z.string(),
  priority: z.string(),
  status: z.string(),
});

// Shared Task create/edit form - used by the Tasks page and the
// Dashboard "Create Task" quick action.
export default function TaskFormModal({ open, onClose, task = null }) {
  const { users, addTask, updateTask } = useCrmData();
  const { user } = useAuth();

  const isEditing = !!task;
  const isAdmin = user?.role === "Administrator";

  const assignableUsers = useMemo(() => {
    if (!user) return [];
    if (user.role === "Administrator") {
      return users?.length ? users : [user];
    }
    return [user];
  }, [user, users]);

  const defaultAssignee = assignableUsers[0]?.name || "";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "Follow-up",
      priority: "Medium",
      status: "Pending",
      assignee: defaultAssignee,
      dueDate: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditing && task) {
        // Editing existing task
        reset({
          title: task.title || "",
          relatedTo: task.relatedTo || "",
          assignee: task.assignee || defaultAssignee,
          type: task.type || "Follow-up",
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
          priority: task.priority || "Medium",
          status: task.status || "Pending",
        });
      } else {
        // Creating new task
        reset({
          title: "",
          relatedTo: "",
          assignee: defaultAssignee,
          type: "Follow-up",
          dueDate: new Date().toISOString().slice(0, 10),
          priority: "Medium",
          status: "Pending",
        });
      }
    }
  }, [defaultAssignee, open, reset, isEditing, task]);

  function close() {
    reset();
    onClose();
  }

  async function onSubmit(values) {
    if (isEditing && task) {
      await updateTask(task.id, values);
    } else {
      await addTask(values);
    }
    close();
  }

  return (
    <Modal open={open} title={isEditing ? "Edit Task" : "Create Task"} onClose={close}>
      <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <FormField label="Title" error={errors.title}>
            <input {...register("title")} />
          </FormField>
          <FormField label="Related To" error={errors.relatedTo}>
            <input {...register("relatedTo")} />
          </FormField>
          <FormField label="Type" error={errors.type}>
            <select {...register("type")}>
              {["Follow-up", "Meeting", "Proposal", "Support", "Call"].map(
                (type) => (
                  <option key={type}>{type}</option>
                ),
              )}
            </select>
          </FormField>
          <FormField label="Priority" error={errors.priority}>
            <select {...register("priority")}>
              {priorities.map((priority) => (
                <option key={priority}>{priority}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Assignee" error={errors.assignee}>
            <select {...register("assignee")} disabled={!isAdmin}>
              {assignableUsers.map((assignee) => (
                <option key={assignee.id || assignee.email} value={assignee.name}>
                  {assignee.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Due Date" error={errors.dueDate}>
            <input type="date" {...register("dueDate")} />
          </FormField>
          <FormField label="Status" error={errors.status}>
            <select {...register("status")}>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </FormField>
        </div>
        <div className="modal-actions">
          <Button type="button" variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" icon={isEditing ? Save : Plus}>
            {isEditing ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}