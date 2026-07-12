import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../common/Button.jsx";
import FormField from "../common/FormField.jsx";
import Modal from "../common/Modal.jsx";
import { useCrmData } from "../../context/CrmDataContext.jsx";
import { industries } from "../../data/mockData.js";

const categories = ["Strategic", "Enterprise", "Mid Market", "SMB"];
const statuses = ["Active", "Renewal", "At Risk", "Inactive"];

const schema = z.object({
  name: z.string().min(2, "Customer name is required"),
  company: z.string().min(2, "Company is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(4, "Address is required"),
  category: z.string(),
  industry: z.string(),
  status: z.string(),
  owner: z.string().min(2, "Owner is required"),
  value: z.coerce.number().min(1, "Value is required"),
  notes: z.string().min(3, "Notes are required"),
});

// Shared Customer create/edit form — used identically by the Customers page
// and the Dashboard "Add Customer" quick action.
export default function CustomerFormModal({ open, onClose, editing = null }) {
  const { users, addCustomer, updateCustomer } = useCrmData();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "Mid Market",
      industry: "Other",
      status: "Active",
      owner: users?.[0]?.name || "",
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
        address: editing.address,
        category: editing.category,
        industry: editing.industry || "Other",
        status: editing.status || "Active",
        owner: editing.owner,
        value: editing.value,
        notes: editing.notes,
      }).forEach(([key, value]) => setValue(key, value));
    } else {
      reset({
        name: "",
        company: "",
        email: "",
        phone: "",
        address: "",
        category: "Mid Market",
        industry: "Other",
        status: "Active",
        owner: users?.[0]?.name || "",
        value: "",
        notes: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing, users]);

  function close() {
    reset();
    onClose();
  }

  async function onSubmit(values) {
    if (editing) {
      await updateCustomer(editing.id, values);
    } else {
      await addCustomer(values);
    }
    close();
  }

  return (
    <Modal
      open={open}
      title={editing ? "Edit customer" : "Add customer"}
      onClose={close}
    >
      <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <FormField label="Customer name" error={errors.name}>
            <input {...register("name")} />
          </FormField>
          <FormField label="Company" error={errors.company}>
            <input {...register("company")} />
          </FormField>
          <FormField label="Email" error={errors.email}>
            <input {...register("email")} />
          </FormField>
          <FormField label="Phone" error={errors.phone}>
            <input {...register("phone")} />
          </FormField>
          <FormField label="Category" error={errors.category}>
            <select {...register("category")}>
              {categories.map((item) => (
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
          <FormField label="Status" error={errors.status}>
            <select {...register("status")}>
              {statuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Owner" error={errors.owner}>
            <select {...register("owner")}>
              {users.map((user) => (
                <option key={user.id}>{user.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Value" error={errors.value}>
            <input type="number" {...register("value")} />
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
            {editing ? "Update Customer" : "Save Customer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
