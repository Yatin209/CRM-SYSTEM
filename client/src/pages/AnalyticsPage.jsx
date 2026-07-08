import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageHeader from "../components/common/PageHeader.jsx";
import { useCrmData } from "../context/CrmDataContext.jsx";
import { formatCurrency } from "../utils/formatters.js";

const colors = ["#0f9f8f", "#3f6ad8", "#f59e0b", "#ef6f6c", "#7c3aed"];

function AnalyticsPage() {
  const { analytics } = useCrmData();

  return (
    <div className="page-stack">
      <PageHeader title="Analytics" eyebrow="Sales intelligence" />
      <section className="analytics-grid">
        <article className="surface chart-card wide">
          <div className="section-title">
            <h2>Monthly Sales</h2>
          </div>
          <ResponsiveContainer width="100%" height={310}>
            <LineChart data={analytics.revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${value / 100000}L`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line type="monotone" dataKey="revenue" stroke="#0f9f8f" strokeWidth={3} />
              <Line type="monotone" dataKey="target" stroke="#ef6f6c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </article>

        <article className="surface chart-card">
          <div className="section-title">
            <h2>Customer Categories</h2>
          </div>
          <ResponsiveContainer width="100%" height={310}>
            <PieChart>
              <Pie data={analytics.categoryData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={100}>
                {analytics.categoryData.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>
      </section>

      <section className="analytics-grid">
        <article className="surface chart-card">
          <div className="section-title">
            <h2>Lead Funnel</h2>
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={analytics.leadFunnel} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {analytics.leadFunnel.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>
    </div>
  );
}

export default AnalyticsPage;
