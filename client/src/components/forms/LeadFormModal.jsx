import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../common/Button.jsx";
import FormField from "../common/FormField.jsx";
import Modal from "../common/Modal.jsx";
import { useCrmData } from "../../context/CrmDataContext.jsx";
import { industries, leadStatuses, priorities } from "../../data/mockData.js";

// Same category options as Customers, so a lead carries its intended
// customer segment straight through conversion.
const categories = ["Strategic", "Enterprise", "Mid Market", "SMB"];

const schema = z.object({
  name: z.string().min(2, "Customer name is required"),
  company: z.string().min(2, "Company is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(8, "Mobile number is required"),
  source: z.string().min(2, "Source is required"),
  status: z.string(),
  category: z.string(),
  priority: z.string(),
  industry: z.string(),
  address: z.string().min(4, "Address is required"),
  value: z.coerce.number().min(1, "Value is required"),
  ownerId: z.string(),
  nextFollowUp: z.string(),
  expectedClose: z.string(),
  notes: z.string().min(3, "Notes are required"),
});

// Shared Lead create/edit form — used identically by the Leads page and the
// Dashboard "Add Lead" quick action, so both go through the same
// validation, API calls, and business logic (no divergent duplicate forms).
export default function LeadFormModal({ open, onClose, editing = null }) {
  const { users, addLead, updateLead } = useCrmData();
  const salesUsers = users.filter(
    (user) => user.role !== "Customer Support Executive",
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "New",
      category: "Mid Market",
      priority: "Medium",
      industry: "Other",
      ownerId: salesUsers[0]?.id || "",
      nextFollowUp: new Date().toISOString().slice(0, 10),
      expectedClose: new Date(Date.now() + 21 * 86400000)
        .toISOString()
        .slice(0, 10),
    },
  });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      Object.entries({
        name: editing.name,
        company: editing.company,
        email: editing.email,
        phone: editing.phone,
        source: editing.source,
        status: editing.status,
        category: editing.category || "Mid Market",
        priority: editing.priority || "Medium",
        industry: editing.industry || "Other",
        address: editing.address || "",
        value: editing.value,
        ownerId: editing.ownerId || "",
        nextFollowUp: editing.nextFollowUp
          ? editing.nextFollowUp.slice(0, 10)
          : "",
        expectedClose: editing.expectedClose
          ? editing.expectedClose.slice(0, 10)
          : "",
        notes: editing.notes,
      }).forEach(([key, value]) => setValue(key, value));
    } else {
      reset({
        name: "",
        company: "",
        email: "",
        phone: "",
        source: "Web Form",
        status: "New",
        category: "Mid Market",
        priority: "Medium",
        industry: "Other",
        address: "",
        value: "",
        ownerId: salesUsers[0]?.id || "",
        nextFollowUp: new Date().toISOString().slice(0, 10),
        expectedClose: new Date(Date.now() + 21 * 86400000)
          .toISOString()
          .slice(0, 10),
        notes: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  function close() {
    reset();
    onClose();
  }

  async function onSubmit(values) {
    const ownerName =
      salesUsers.find((u) => u.id === values.ownerId)?.name || "Unassigned";
    const payload = { ...values, owner: ownerName };
    if (editing) {
      await updateLead(editing.id, payload);
    } else {
      await addLead(payload);
    }
    close();
  }

  return (
    <Modal open={open} title={editing ? "Edit Lead" : "Add Lead"} onClose={close}>
      <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <FormField label="Customer Name" error={errors.name}>
            <input {...register("name")} />
          </FormField>
          <FormField label="Company" error={errors.company}>
            <input {...register("company")} />
          </FormField>
          <FormField label="Email" error={errors.email}>
            <input {...register("email")} />
          </FormField>
          <FormField label="Mobile" error={errors.phone}>
            <input {...register("phone")} />
          </FormField>
          <FormField label="Source" error={errors.source}>
            <input {...register("source")} />
          </FormField>
          <FormField label="Value" error={errors.value}>
            <input type="number" {...register("value")} />
          </FormField>
          <FormField label="Status" error={errors.status}>
            <select {...register("status")}>
              {leadStatuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Category" error={errors.category}>
            <select {...register("category")}>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Priority" error={errors.priority}>
            <select {...register("priority")}>
              {priorities.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Industry" error={errors.industry}>
            <select {...register("industry")}>
              {industries
                .filter((item) => item !== "All")
                .map((item) => (
                  <option key={item}>{item}</option>
                ))}
            </select>
          </FormField>
          <FormField label="Owner" error={errors.ownerId}>
            <select {...register("ownerId")}>
              {salesUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Next follow-up" error={errors.nextFollowUp}>
            <input type="date" {...register("nextFollowUp")} />
          </FormField>
          <FormField label="Expected close" error={errors.expectedClose}>
            <input type="date" {...register("expectedClose")} />
          </FormField>
        </div>
        <FormField label="Address" error={errors.address}>
          <input {...register("address")} />
        </FormField>
        <FormField label="Notes" error={errors.notes}>
          <textarea rows="3" {...register("notes")} />
        </FormField>
        <div className="modal-actions">
          <Button type="button" variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" icon={Plus}>
            {editing ? "Update Lead" : "Save Lead"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
