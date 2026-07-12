import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Download, Edit3, Plus, Trash2, Building2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../components/common/Badge.jsx";
import Button from "../components/common/Button.jsx";
import ConfirmPopover from "../components/common/ConfirmPopover.jsx";
import DataTable from "../components/common/DataTable.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import SearchInput from "../components/common/SearchInput.jsx";
import CustomerDetailModal from "../components/common/CustomerDetailModal.jsx";
import CampaignFormModal, {
  campaignStatuses as statuses,
  campaignTypes as types,
} from "../components/forms/CampaignFormModal.jsx";
import { useCrmData } from "../context/CrmDataContext.jsx";
import { formatDate } from "../utils/formatters.js";
import { downloadCsv } from "../utils/csvExport.js";

// Distinct color per campaign status for quick visual scanning.
const STATUS_COLORS = {
  Draft: "#64748b",
  Active: "#0f9f8f",
  Paused: "#f59e0b",
  Completed: "#3f6ad8",
  Cancelled: "#ef6f6c",
};

function CampaignsPage() {
  const { campaigns, removeCampaign, customers, users } = useCrmData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return campaigns.filter((campaign) => {
      const matchesQuery = [
        campaign.name,
        campaign.type,
        campaign.owner,
        campaign.status,
        campaign.customerName,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
      const matchesStatus =
        statusFilter === "All" || campaign.status === statusFilter;
      const matchesType = typeFilter === "All" || campaign.type === typeFilter;
      return matchesQuery && matchesStatus && matchesType;
    });
  }, [campaigns, query, statusFilter, typeFilter]);

  const campaignStats = useMemo(() => {
    const total = campaigns.length;
    const active = campaigns.filter((item) => item.status === "Active").length;
    const completed = campaigns.filter(
      (item) => item.status === "Completed",
    ).length;
    const cancelled = campaigns.filter(
      (item) => item.status === "Cancelled",
    ).length;
    return { total, active, completed, cancelled };
  }, [campaigns]);

  const statusChart = useMemo(() => {
    return statuses
      .map((value) => ({
        name: value,
        count: campaigns.filter((item) => item.status === value).length,
      }))
      .filter((s) => s.count > 0);
  }, [campaigns]);

  function openEditor(campaign) {
    setEditing(campaign);
    setOpen(true);
  }

  function closeEditor() {
    setEditing(null);
    setOpen(false);
  }

  function handleCustomerClick(customerId) {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setCustomerModalOpen(true);
    }
  }

  function closeCustomerModal() {
    setCustomerModalOpen(false);
    setSelectedCustomer(null);
  }

  function handleExport() {
    const ts = new Date().toISOString().slice(0, 10);
    downloadCsv(`nexacrm-campaigns-${ts}.csv`, campaigns, users);
  }

  const columns = [
    {
      key: "name",
      header: "Campaign",
      render: (row) => (
        <div className="cell-title">
          <strong>{row.name}</strong>
          <span>{row.type}</span>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Linked Customers",
      render: (row) =>
        row.customer && row.customerName ? (
          <div className="customer-cards-wrapper">
            <button
              className="customer-link-card"
              onClick={() => handleCustomerClick(row.customer)}
              title="Click to view customer details"
            >
              <Building2 size={16} />
              <span>{row.customerName}</span>
            </button>
          </div>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge style={{ background: STATUS_COLORS[row.status], color: "#fff" }}>
          {row.status}
        </Badge>
      ),
    },
    { key: "owner", header: "Owner" },
    {
      key: "startDate",
      header: "Start",
      render: (row) => formatDate(row.startDate),
    },
    { key: "endDate", header: "End", render: (row) => formatDate(row.endDate) },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="row-actions row-actions-inline">
          <Button variant="ghost" icon={Edit3} onClick={() => openEditor(row)}>
            Edit
          </Button>
          <ConfirmPopover
            message={`Delete campaign "${row.name}"?`}
            onConfirm={() => removeCampaign(row.id)}
          >
            {(openConfirm) => (
              <Button variant="ghost" icon={Trash2} onClick={openConfirm}>
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
        title="Campaigns"
        eyebrow="Campaign management"
        actions={
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button variant="ghost" icon={Download} onClick={handleExport}>
              Export CSV
            </Button>
            <Button icon={Plus} onClick={() => setOpen(true)}>
              New Campaign
            </Button>
          </div>
        }
      />

      <section className="stat-grid stat-grid-lg">
        <Badge tone="primary">Total Campaigns: {campaignStats.total}</Badge>
        <Badge tone="success">Active: {campaignStats.active}</Badge>
        <Badge tone="info">Completed: {campaignStats.completed}</Badge>
        <Badge tone="danger">Cancelled: {campaignStats.cancelled}</Badge>
      </section>

      <section className="surface">
        <div className="toolbar">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search campaigns"
          />
          <div className="filter-groups filter-groups-spaced">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All</option>
              {statuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option>All</option>
              {types.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          emptyTitle="No campaigns found"
        />
      </section>

      <section className="dashboard-grid single-col">
        <article className="surface chart-card">
          <div className="section-title">
            <h2>Campaign Status</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusChart}
                dataKey="count"
                nameKey="name"
                innerRadius={52}
                outerRadius={90}
                label
              >
                {statusChart.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>
      </section>

      <CampaignFormModal open={open} onClose={closeEditor} editing={editing} />
      <CustomerDetailModal
        open={customerModalOpen}
        onClose={closeCustomerModal}
        customer={selectedCustomer}
      />
    </div>
  );
}

export default CampaignsPage;
