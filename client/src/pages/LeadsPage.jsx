import { Edit3, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../components/common/Badge.jsx";
import Button from "../components/common/Button.jsx";
import ConfirmPopover from "../components/common/ConfirmPopover.jsx";
import DataTable from "../components/common/DataTable.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import SearchInput from "../components/common/SearchInput.jsx";
import LeadFormModal from "../components/forms/LeadFormModal.jsx";
import { useCrmData } from "../context/CrmDataContext.jsx";
import { leadStatuses } from "../data/mockData.js";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { formatCurrency, statusTone } from "../utils/formatters.js";

function LeadsPage() {
  const { leads, removeLead } = useCrmData();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const debouncedQuery = useDebouncedValue(query);

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
  }

  function closeEditor() {
    setEditing(null);
    setOpen(false);
  }

  const columns = [
    {
      key: "lead",
      header: "Lead",
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
      render: (lead) => <Badge tone="primary">{lead.category || "Mid Market"}</Badge>,
    },
    {
      key: "priority",
      header: "Priority",
      render: (lead) => <Badge tone={statusTone(lead.priority)}>{lead.priority || "Medium"}</Badge>,
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
        <div className="row-actions row-actions-inline">
          <Button
            size="sm"
            variant="ghost"
            icon={Edit3}
            onClick={() => openEditor(lead)}
          >
            Edit
          </Button>
          <ConfirmPopover
            message={`Delete lead "${lead.name}"?`}
            onConfirm={() => removeLead(lead.id)}
          >
            {(openConfirm) => (
              <Button size="sm" variant="ghost" icon={Trash2} onClick={openConfirm}>
                Delete
              </Button>
            )}
          </ConfirmPopover>
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

      <LeadFormModal open={open} onClose={closeEditor} editing={editing} />
    </div>
  );
}

export default LeadsPage;
