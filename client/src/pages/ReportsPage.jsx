import dayjs from "dayjs";
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
import { downloadCsv } from "../utils/csvExport.js";

const chartColors = ["#0f9f8f", "#3f6ad8", "#f59e0b", "#ef6f6c", "#7c3aed"];

// Builds a fully styled, standalone HTML document (tables + summary cards)
// and triggers a download — replacing the old unstyled window.print().
function downloadPrintableReport({ reportCards, funnelData, statusData, generatedAt }) {
  const style = `
    body { font-family: Arial, Helvetica, sans-serif; color: #1e293b; margin: 40px; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .muted { color: #64748b; font-size: 13px; margin-bottom: 24px; }
    .cards { display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
    .card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; min-width: 160px; }
    .card strong { display: block; font-size: 20px; }
    .card span { font-size: 12px; color: #64748b; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; font-size: 13px; }
    th { background: #f1f5f9; }
    h2 { font-size: 16px; margin: 24px 0 8px; }
    @media print { body { margin: 12mm; } }
  `;
  const cardsHtml = reportCards
    .map(
      (c) =>
        `<div class="card"><span>${c.label}</span><strong>${c.value}</strong><span>${c.detail}</span></div>`,
    )
    .join("");
  const funnelHtml = funnelData
    .map((f) => `<tr><td>${f.name}</td><td>${f.value}</td></tr>`)
    .join("");
  const statusHtml = statusData
    .map((s) => `<tr><td>${s.name}</td><td>${s.value}</td></tr>`)
    .join("");

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>NexaCRM Report</title><style>${style}</style></head>
<body>
  <h1>NexaCRM — Business Report</h1>
  <p class="muted">Generated on ${generatedAt}</p>
  <div class="cards">${cardsHtml}</div>
  <h2>Lead Funnel</h2>
  <table><thead><tr><th>Stage</th><th>Leads</th></tr></thead><tbody>${funnelHtml}</tbody></table>
  <h2>Campaign Status</h2>
  <table><thead><tr><th>Status</th><th>Campaigns</th></tr></thead><tbody>${statusHtml}</tbody></table>
</body></html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `nexacrm-report-${dayjs().format("YYYY-MM-DD")}.html`;
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
    users = [],
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

  const funnelData = analytics.leadFunnel;

  const statusData = analytics.campaignStatusData.filter(
    (item) => item.value > 0,
  );

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
              onClick={() =>
                downloadPrintableReport({
                  reportCards,
                  funnelData,
                  statusData,
                  generatedAt: dayjs().format("MMM D, YYYY h:mm A"),
                })
              }
            >
              Print
            </Button>
            <Button
              icon={Download}
              onClick={() => downloadCsv("nexacrm-leads.csv", leads, users)}
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
              <Bar dataKey="value" name="Lead Count" radius={[6, 6, 0, 0]}>
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
      </section>
    </div>
  );
}

export default ReportsPage;
