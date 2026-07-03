import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { customerCategories } from "../data/mockData.js";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { formatCurrency, statusTone } from "../utils/formatters.js";

const schema = z.object({
  name: z.string().min(2, "Customer name is required"),
  company: z.string().min(2, "Company is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(8, "Phone number is required"),
  source: z.string().min(2, "Source is required"),
  status: z.string(),
  category: z.string(),
  value: z.coerce.number().min(1, "Value is required"),
  address: z.string().min(4, "Address is required"),
  ownerId: z.string(),
  nextFollowUp: z.string(),
  expectedClose: z.string(),
  notes: z.string().min(3, "Notes are required"),
});

function LeadsPage() {
  const {
    leads,
    users,
    addLead,
    updateLead,
    removeLead,
    convertLead,
    leadStatuses,
  } = useCrmData();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const debouncedQuery = useDebouncedValue(query);
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
      ownerId: "u_sales",
      nextFollowUp: new Date().toISOString().slice(0, 10),
      expectedClose: new Date(Date.now() + 21 * 86400000)
        .toISOString()
        .slice(0, 10),
    },
  });

  const filtered = useMemo(() => {
    const needle = debouncedQuery.toLowerCase();
    return leads.filter((lead) => {
      const matchesQuery = [lead.name, lead.company, lead.email, lead.owner]
        .join(" ")
        .toLowerCase()
        .includes(needle);
      const matchesStatus = status === "All" || lead.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [debouncedQuery, leads, status]);

  function openEditor(lead) {
    setEditing(lead);
    setOpen(true);
    Object.entries({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
      category: lead.category || "Mid Market",
      value: lead.value,
      address: lead.address || "",
      ownerId: lead.ownerId || "",
      nextFollowUp: lead.nextFollowUp ? lead.nextFollowUp.slice(0, 10) : "",
      expectedClose: lead.expectedClose ? lead.expectedClose.slice(0, 10) : "",
      notes: lead.notes,
    }).forEach(([key, value]) => setValue(key, value));
  }

  function closeEditor() {
    setEditing(null);
    setOpen(false);
    reset();
  }

  async function onSubmit(values) {
    const wasConverted = editing?.status === "Converted";
    const isNowConverted = values.status === "Converted";

    if (editing) {
      await updateLead(editing.id, values);
    } else {
      await addLead(values);
    }

    // Auto-create/move record into Customers when status changes to Converted
    if (isNowConverted && !wasConverted && editing) {
      await convertLead(editing.id);
    }

    closeEditor();
  }

  function handleDelete(lead) {
    if (
      window.confirm(`Delete lead "${lead.name}"? This data will be deleted.`)
    ) {
      removeLead(lead.id);
    }
  }

  const columns = [
    {
      key: "lead",
      header: "Customer Name",
      render: (lead) => (
        <div className="cell-title">
          <strong>{lead.name}</strong>
          <span>{lead.company}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (lead) => (
        <Badge tone={statusTone(lead.status)}>{lead.status}</Badge>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (lead) => <Badge tone="primary">{lead.category || "—"}</Badge>,
    },
    {
      key: "value",
      header: "Value",
      render: (lead) => formatCurrency(lead.value),
    },
    { key: "owner", header: "Owner" },
    {
      key: "actions",
      header: "Actions",
      render: (lead) => (
        <div className="row-actions">
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate(`/leads/${lead._id || lead.id}`)}
          >
            View
          </Button>

          <Button
            size="sm"
            variant="ghost"
            icon={Edit3}
            onClick={() => openEditor(lead)}
          >
            Edit
          </Button>

          <Button
            size="sm"
            variant="ghost"
            icon={Trash2}
            onClick={() => handleDelete(lead)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title="Leads"
        eyebrow="Sales lifecycle"
        actions={
          <Button icon={Plus} onClick={() => setOpen(true)}>
            Add Lead
          </Button>
        }
      />

      <section className="surface">
        <div className="toolbar">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search leads"
          />
          <select
            className="form-select compact-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option>All</option>
            {leadStatuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          emptyTitle="No leads found"
        />
      </section>

      <Modal
        open={open}
        title={editing ? "Edit lead" : "Add lead"}
        onClose={closeEditor}
      >
        <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <FormField label="Name" error={errors.name}>
              <input {...register("name")} />
            </FormField>
            <FormField label="Company Name" error={errors.company}>
              <input {...register("company")} />
            </FormField>
            <FormField label="Email" error={errors.email}>
              <input {...register("email")} />
            </FormField>
            <FormField label="Phone" error={errors.phone}>
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
                {customerCategories.map((item) => (
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
            <Button variant="ghost" onClick={closeEditor}>
              Cancel
            </Button>
            <Button type="submit" icon={Plus}>
              {editing ? "Update Lead" : "Save Lead"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default LeadsPage;
