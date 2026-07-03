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
import { Download, FileText, Printer } from "lucide-react";
import Button from "../components/common/Button.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import StatCard from "../components/common/StatCard.jsx";
import { useCrmData } from "../context/CrmDataContext.jsx";
import { formatCurrency, formatNumber } from "../utils/formatters.js";

const chartColors = ["#0f9f8f", "#3f6ad8", "#f59e0b", "#ef6f6c", "#7c3aed"];

function downloadCsv(filename, rows) {
  const headers = Object.keys(rows[0] || {});
  const body = rows.map((row) =>
    headers.map((header) => JSON.stringify(row[header] ?? "")).join(","),
  );
  const csv = [headers.join(","), ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function ReportsPage() {
  const {
    analytics,
    customers,
    leads,
    tasks,
    communications,
    metrics,
    pipeline,
  } = useCrmData();

  const reportCards = [
    {
      label: "Customers",
      value: formatNumber(customers.length),
      detail: "Active accounts",
    },
    {
      label: "Leads",
      value: formatNumber(leads.length),
      detail: "Current pipeline",
    },
    {
      label: "Open Work",
      value: formatNumber(tasks.length),
      detail: `${communications.length} communications logged`,
    },
    {
      label: "Revenue",
      value: formatCurrency(metrics.monthlyRevenue),
      detail: "Estimated monthly value",
    },
  ];

  const activityData = [
    { name: "Leads", value: leads.length },
    { name: "Customers", value: customers.length },
    { name: "Tasks", value: tasks.length },
    { name: "Communications", value: communications.length },
  ];

  const funnelData = pipeline.map((stage) => ({
    name: stage.stage,
    count: stage.leads.length,
    value: stage.value,
  }));

  const statusData = analytics.campaignStatusData.filter(
    (item) => item.value > 0,
  );
  const budgetRevenueData = analytics.campaignBudgetRevenue.length
    ? analytics.campaignBudgetRevenue
    : [{ name: "No campaigns", budget: 0, actualRevenue: 0 }];

  return (
    <div className="page-stack">
      <PageHeader
        title="Reports"
        eyebrow="Interactive reports and trend analytics"
        actions={
          <>
            <Button
              variant="ghost"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print
            </Button>
            <Button
              icon={Download}
              onClick={() => downloadCsv("nexacrm-leads.csv", leads)}
            >
              Export CSV
            </Button>
          </>
        }
      />

      <section className="stat-grid">
        {reportCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            detail={card.detail}
            icon={FileText}
            tone="blue"
          />
        ))}
      </section>

      <section className="analytics-grid">
        <article className="surface chart-card wide">
          <div className="section-title">
            <h2>Revenue Trend</h2>
            <span>{formatCurrency(metrics.monthlyRevenue)} this month</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={analytics.revenueData}
              margin={{ left: -16, right: 6 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${value / 100000}L`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={chartColors[0]}
                strokeWidth={3}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke={chartColors[3]}
                strokeWidth={2}
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </article>

        <article className="surface chart-card">
          <div className="section-title">
            <h2>Activity Split</h2>
            <span>Live distribution of work across CRM entities</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={activityData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
              >
                {activityData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={chartColors[index % chartColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </article>
      </section>

      <section className="analytics-grid">
        <article className="surface chart-card">
          <div className="section-title">
            <h2>Lead Funnel</h2>
            <span>Stage progression across current leads</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={funnelData} margin={{ left: -12, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Bar dataKey="count" name="Lead Count" radius={[6, 6, 0, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={chartColors[index % chartColors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="surface chart-card">
          <div className="section-title">
            <h2>Campaign Performance</h2>
            <span>Budget vs actual revenue for active campaigns</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={budgetRevenueData}
              margin={{ left: -10, right: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={70}
              />
              <YAxis
                tickFormatter={(value) => `${Math.round(value / 1000)}k`}
              />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend verticalAlign="top" height={36} />
              <Bar
                dataKey="budget"
                name="Budget"
                fill={chartColors[1]}
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="actualRevenue"
                name="Revenue"
                fill={chartColors[0]}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>

      <section className="analytics-grid">
        <article className="surface chart-card">
          <div className="section-title">
            <h2>Campaign Status</h2>
            <span>Active vs paused and completed campaigns</span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={62}
                outerRadius={100}
                paddingAngle={4}
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={chartColors[index % chartColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="surface chart-card">
          <div className="section-title">
            <h2>Conversion Summary</h2>
            <span>
              {metrics.convertedLeads} leads converted from the active pipeline
            </span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={analytics.conversionData}
              margin={{ left: -12, right: 12 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Bar dataKey="value" name="Conversions" radius={[6, 6, 0, 0]}>
                {analytics.conversionData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={chartColors[index % chartColors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>
    </div>
  );
}

export default ReportsPage;
