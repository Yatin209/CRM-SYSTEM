import { zodResolver } from "@hookform/resolvers/zod";
import { Megaphone } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Button from "../common/Button.jsx";
import FormField from "../common/FormField.jsx";
import Modal from "../common/Modal.jsx";
import { useCrmData } from "../../context/CrmDataContext.jsx";
import { ROLES } from "../../config/roles.js";

export const campaignTypes = [
  "Email",
  "WhatsApp",
  "SMS",
  "Social Media",
  "Referral",
  "Event",
  "Cold Calling",
  "Other",
];
export const campaignStatuses = ["Draft", "Active", "Paused", "Completed", "Cancelled"];

const schema = z.object({
  name: z.string().min(2, "Campaign name is required"),
  type: z.string().min(2, "Type is required"),
  owner: z.string().min(2, "Owner is required"),
  status: z.string(),
  customer: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  description: z.string().optional(),
});

// Shared Campaign create/edit form — used identically by the Campaigns page
// and the Dashboard "New Campaign" quick action. Includes a searchable
// Customer selector so campaigns link to real customer records.
export default function CampaignFormModal({ open, onClose, editing = null }) {
  const { users, customers, addCampaign, updateCampaign } = useCrmData();
  const salesUsers = users.filter((u) => u.role !== ROLES.SUPPORT);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      type: campaignTypes[0],
      owner: salesUsers[0]?.name || "",
      status: campaignStatuses[0],
      customer: "",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      description: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      Object.entries({
        name: editing.name,
        type: editing.type,
        owner: editing.owner,
        status: editing.status,
        customer: editing.customer || "",
        startDate: editing.startDate?.slice(0, 10),
        endDate: editing.endDate?.slice(0, 10),
        description: editing.description,
      }).forEach(([key, value]) => setValue(key, value));
    } else {
      reset({
        name: "",
        type: campaignTypes[0],
        owner: salesUsers[0]?.name || "",
        status: campaignStatuses[0],
        customer: "",
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + 14 * 86400000)
          .toISOString()
          .slice(0, 10),
        description: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing]);

  function close() {
    reset();
    onClose();
  }

  async function onSubmit(values) {
    const payload = { ...values, customer: values.customer || null };
    if (editing) {
      await updateCampaign(editing.id, payload);
    } else {
      await addCampaign(payload);
    }
    close();
  }

  return (
    <Modal
      open={open}
      title={editing ? "Edit Campaign" : "New Campaign"}
      onClose={close}
    >
      <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-grid">
          <FormField label="Campaign Name" error={errors.name}>
            <input {...register("name")} />
          </FormField>
          <FormField label="Type" error={errors.type}>
            <select {...register("type")}>
              {campaignTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Status" error={errors.status}>
            <select {...register("status")}>
              {campaignStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Owner" error={errors.owner}>
            <select {...register("owner")}>
              {salesUsers.map((user) => (
                <option key={user.id}>{user.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Start Date" error={errors.startDate}>
            <input type="date" {...register("startDate")} />
          </FormField>
          <FormField label="End Date" error={errors.endDate}>
            <input type="date" {...register("endDate")} />
          </FormField>
        </div>
        <FormField label="Linked Customer (optional)" error={errors.customer}>
          <select {...register("customer")}>
            <option value="">— No customer linked —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company} — {c.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Description" error={errors.description}>
          <textarea rows="3" {...register("description")} />
        </FormField>
        <div className="modal-actions">
          <Button type="button" variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" icon={Megaphone}>
            {editing ? "Update Campaign" : "Launch Campaign"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
