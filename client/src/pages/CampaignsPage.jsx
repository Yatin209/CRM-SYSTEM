import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CheckCircle2,
  Edit3,
  Layers,
  Plus,
  Target,
  TrendingUp,
  Trash2,
  Wallet,
  XCircle,
} from "lucide-react";
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
import StatCard from "../components/common/StatCard.jsx";
import { useCrmData } from "../context/CrmDataContext.jsx";
import { ROLES } from "../config/roles.js";
import { formatCurrency, formatDate, statusTone } from "../utils/formatters.js";

const schema = z.object({
  name: z.string().min(2, "Campaign name is required"),
  type: z.string().min(2, "Type is required"),
  owner: z.string().min(2, "Owner is required"),
  budget: z.coerce.number().min(0, "Budget is required"),
  expectedRevenue: z.coerce.number().min(0, "Expected revenue is required"),
  actualRevenue: z.coerce.number().min(0, "Actual revenue is required"),
  status: z.string(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  description: z.string().optional(),
});

const types = [
  "Email",
  "WhatsApp",
  "SMS",
  "Social Media",
  "Referral",
  "Event",
  "Cold Calling",
  "Other",
];
const statuses = ["Draft", "Active", "Paused", "Completed", "Cancelled"];

function CampaignsPage() {
  const { campaigns, users, addCampaign, updateCampaign, removeCampaign } =
    useCrmData();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

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
      type: types[0],
      owner: salesUsers[0]?.name || "",
      budget: 0,
      expectedRevenue: 0,
      actualRevenue: 0,
      status: statuses[0],
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      description: "",
    },
  });

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return campaigns.filter((campaign) => {
      const matchesQuery = [
        campaign.name,
        campaign.type,
        campaign.owner,
        campaign.status,
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
    const budget = campaigns.reduce(
      (sum, item) => sum + Number(item.budget || 0),
      0,
    );
    const expectedRevenue = campaigns.reduce(
      (sum, item) => sum + Number(item.expectedRevenue || 0),
      0,
    );
    const actualRevenue = campaigns.reduce(
      (sum, item) => sum + Number(item.actualRevenue || 0),
      0,
    );
    const roi =
      budget > 0 ? Math.round(((actualRevenue - budget) / budget) * 100) : 0;
    return {
      total,
      active,
      completed,
      cancelled,
      budget,
      expectedRevenue,
      actualRevenue,
      roi,
    };
  }, [campaigns]);

  const statusChart = useMemo(() => {
    return statuses.map((value) => ({
      name: value,
      count: campaigns.filter((item) => item.status === value).length,
    }));
  }, [campaigns]);

  const budgetRevenueData = useMemo(() => {
    return campaigns.slice(0, 8).map((campaign) => ({
      name: campaign.name,
      budget: Number(campaign.budget || 0),
      actualRevenue: Number(campaign.actualRevenue || 0),
    }));
  }, [campaigns]);

  const topCampaigns = useMemo(() => {
    return [...campaigns]
      .sort(
        (a, b) =>
          Number(b.roi || 0) - Number(a.roi || 0) ||
          Number(b.actualRevenue || 0) - Number(a.actualRevenue || 0),
      )
      .slice(0, 5);
  }, [campaigns]);

  function openEditor(campaign) {
    setEditing(campaign);
    setOpen(true);
    Object.entries({
      name: campaign.name,
      type: campaign.type,
      owner: campaign.owner,
      budget: campaign.budget,
      expectedRevenue: campaign.expectedRevenue,
      actualRevenue: campaign.actualRevenue,
      status: campaign.status,
      startDate: campaign.startDate.slice(0, 10),
      endDate: campaign.endDate.slice(0, 10),
      description: campaign.description,
    }).forEach(([key, value]) => setValue(key, value));
  }

  function closeEditor() {
    setEditing(null);
    setOpen(false);
    reset();
  }

  async function onSubmit(values) {
    if (editing) {
      await updateCampaign(editing.id, values);
    } else {
      await addCampaign(values);
    }
    closeEditor();
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
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge tone={statusTone(row.status)}>{row.status}</Badge>
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
      key: "budget",
      header: "Budget",
      render: (row) => formatCurrency(row.budget),
    },
    {
      key: "actualRevenue",
      header: "Revenue",
      render: (row) => formatCurrency(row.actualRevenue),
    },
    {
      key: "roi",
      header: "ROI",
      render: (row) => `${Math.round(row.roi || 0)}%`,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="row-actions">
          <Button variant="ghost" icon={Edit3} onClick={() => openEditor(row)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            icon={Trash2}
            onClick={() => removeCampaign(row.id)}
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
        title="Campaigns"
        eyebrow="Campaign management"
        actions={
          <Button icon={Plus} onClick={() => setOpen(true)}>
            New Campaign
          </Button>
        }
      />

      <section className="stat-grid">
        <StatCard tone="teal" icon={Layers} label="Total Campaigns" value={campaignStats.total} />
        <StatCard tone="blue" icon={TrendingUp} label="Active" value={campaignStats.active} />
        <StatCard tone="amber" icon={CheckCircle2} label="Completed" value={campaignStats.completed} />
        <StatCard tone="coral" icon={XCircle} label="Cancelled" value={campaignStats.cancelled} />
        <StatCard tone="teal" icon={Wallet} label="Budget" value={formatCurrency(campaignStats.budget)} />
        <StatCard tone="blue" icon={Target} label="Expected Revenue" value={formatCurrency(campaignStats.expectedRevenue)} />
        <StatCard tone="amber" icon={TrendingUp} label="Actual Revenue" value={formatCurrency(campaignStats.actualRevenue)} />
        <StatCard tone="coral" icon={TrendingUp} label="ROI" value={`${campaignStats.roi}%`} />
      </section>

      <section className="surface">
        <div className="toolbar">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search campaigns"
          />
          <div className="filter-groups">
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

      <section className="dashboard-grid">
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
                {statusChart.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={
                      ["#3f6ad8", "#0f9f8f", "#f59e0b", "#ef6f6c", "#64748b"][
                        index % 5
                      ]
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="surface chart-card">
          <div className="section-title">
            <h2>Budget vs Revenue</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={budgetRevenueData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `${value / 100000}L`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar
                dataKey="budget"
                name="Budget"
                fill="#0f9f8f"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="actualRevenue"
                name="Revenue"
                fill="#ef6f6c"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="surface full-width-widget">
          <div className="section-title">
            <h2>Top Performing Campaigns</h2>
          </div>
          <div className="table-shell">
            <table className="table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Type</th>
                  <th>Owner</th>
                  <th>ROI</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topCampaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>
                      <strong>{campaign.name}</strong>
                    </td>
                    <td>{campaign.type}</td>
                    <td>{campaign.owner}</td>
                    <td>
                      <Badge tone={Number(campaign.roi || 0) >= 0 ? "success" : "danger"}>
                        {campaign.roi ?? 0}%
                      </Badge>
                    </td>
                    <td>{formatCurrency(campaign.actualRevenue)}</td>
                  </tr>
                ))}
                {topCampaigns.length === 0 && (
                  <tr>
                    <td colSpan={5}>No campaign data yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <Modal
        open={open}
        title={editing ? "Edit Campaign" : "New Campaign"}
        onClose={closeEditor}
      >
        <form className="modal-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-grid">
            <FormField label="Campaign Name" error={errors.name}>
              <input {...register("name")} />
            </FormField>
            <FormField label="Type" error={errors.type}>
              <select {...register("type")}>
                {types.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Status" error={errors.status}>
              <select {...register("status")}>
                {statuses.map((status) => (
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
            <FormField label="Budget" error={errors.budget}>
              <input type="number" {...register("budget")} />
            </FormField>
            <FormField label="Expected Revenue" error={errors.expectedRevenue}>
              <input type="number" {...register("expectedRevenue")} />
            </FormField>
            <FormField label="Actual Revenue" error={errors.actualRevenue}>
              <input type="number" {...register("actualRevenue")} />
            </FormField>
          </div>
          <FormField label="Description" error={errors.description}>
            <textarea rows="3" {...register("description")} />
          </FormField>
          <div className="modal-actions">
            <Button variant="ghost" onClick={closeEditor}>
              Cancel
            </Button>
            <Button type="submit" icon={Plus}>
              {editing ? "Update Campaign" : "Create Campaign"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CampaignsPage;
