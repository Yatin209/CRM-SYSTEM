import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../common/Button.jsx";
import FormField from "../common/FormField.jsx";
import Modal from "../common/Modal.jsx";
import { useCrmData } from "../../context/CrmDataContext.jsx";
import { priorities } from "../../data/mockData.js";

const schema = z.object({
  title: z.string().min(3, "Task title is required"),
  relatedTo: z.string().min(2, "Related record is required"),
  assignee: z.string().min(2, "Assignee is required"),
  type: z.string(),
  dueDate: z.string(),
  priority: z.string(),
});

// Shared Task create form — used identically by the Tasks page and the
// Dashboard "Create Task" quick action.
export default function TaskFormModal({ open, onClose }) {
  const { users, addTask } = useCrmData();

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
      assignee: users?.[0]?.name || "",
      dueDate: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        title: "",
        relatedTo: "",
        assignee: users?.[0]?.name || "",
        type: "Follow-up",
        dueDate: new Date().toISOString().slice(0, 10),
        priority: "Medium",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, users]);

  function close() {
    reset();
    onClose();
  }

  async function onSubmit(values) {
    await addTask(values);
    close();
  }

  return (
    <Modal open={open} title="Create Task" onClose={close}>
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
                (t) => (
                  <option key={t}>{t}</option>
                ),
              )}
            </select>
          </FormField>
          <FormField label="Priority" error={errors.priority}>
            <select {...register("priority")}>
              {priorities.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Assignee" error={errors.assignee}>
            <select {...register("assignee")}>
              {users?.map((u) => (
                <option key={u.id}>{u.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Due Date" error={errors.dueDate}>
            <input type="date" {...register("dueDate")} />
          </FormField>
        </div>
        <div className="modal-actions">
          <Button type="button" variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" icon={Plus}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
