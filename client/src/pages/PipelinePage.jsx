import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import {
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  GripVertical,
  Mail,
  Phone,
  RefreshCw,
  ThumbsDown,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import PageHeader from "../components/common/PageHeader.jsx";
import SearchInput from "../components/common/SearchInput.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCrmData } from "../context/CrmDataContext.jsx";
import { pipelineStages, priorities } from "../data/mockData.js";
import { formatCurrency } from "../utils/formatters.js";

dayjs.extend(relativeTime);

// Visual identity for each pipeline stage — color + representative
// touchpoint icon.
const STAGE_META = {
  New: { icon: Clock, colorClass: "stage-0" },
  Contacted: { icon: Phone, colorClass: "stage-1" },
  Interested: { icon: Mail, colorClass: "stage-2" },
  Qualified: { icon: FileText, colorClass: "stage-2b" },
  "Proposal Sent": { icon: FileText, colorClass: "stage-3" },
  Negotiation: { icon: RefreshCw, colorClass: "stage-4" },
  Converted: { icon: CheckCircle2, colorClass: "stage-5" },
  Lost: { icon: ThumbsDown, colorClass: "stage-6" },
};

const DATE_RANGES = ["Any time", "Last 7 days", "Last 30 days", "Last 90 days"];

const DEFAULT_FILTERS = {
  stage: "All",
  owner: "All",
  source: "All",
  minValue: "",
  maxValue: "",
  createdWithin: "Any time",
  activityWithin: "Any time",
  priority: "All",
  industry: "All",
};

function withinRange(dateValue, range) {
  if (range === "Any time" || !dateValue) return true;
  const days = { "Last 7 days": 7, "Last 30 days": 30, "Last 90 days": 90 }[range];
  return dayjs().diff(dayjs(dateValue), "day") <= days;
}

function PipelinePage() {
  const { leads, pipeline, updateLeadStage } = useCrmData();
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const sources = useMemo(
    () => ["All", ...new Set(leads.map((l) => l.source).filter(Boolean))],
    [leads],
  );
  const industries = useMemo(
    () => ["All", ...new Set(leads.map((l) => l.industry).filter(Boolean))],
    [leads],
  );

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value !== DEFAULT_FILTERS[key],
  ).length;

  function setFilter(key, value) {
    setFilters((cur) => ({ ...cur, [key]: value }));
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  function onDrop(event, stage) {
    const leadId = event.dataTransfer.getData("text/plain");
    if (leadId) {
      updateLeadStage(leadId, stage);
    }
  }

  function matchesLead(lead) {
    if (filters.stage !== "All" && lead.status !== filters.stage) return false;
    if (filters.owner === "Me" && lead.ownerId !== currentUser?.id) return false;
    if (filters.owner === "Unassigned" && lead.ownerId) return false;
    if (filters.owner === "Assigned" && !lead.ownerId) return false;
    if (filters.source !== "All" && lead.source !== filters.source) return false;
    if (filters.priority !== "All" && lead.priority !== filters.priority) return false;
    if (filters.industry !== "All" && lead.industry !== filters.industry) return false;
    if (filters.minValue && Number(lead.value || 0) < Number(filters.minValue)) return false;
    if (filters.maxValue && Number(lead.value || 0) > Number(filters.maxValue)) return false;
    if (!withinRange(lead.createdAt, filters.createdWithin)) return false;
    if (!withinRange(lead.updatedAt || lead.createdAt, filters.activityWithin)) return false;
    return true;
  }

  const filteredPipeline = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return pipeline.map((column) => ({
      ...column,
      leads: column.leads.filter(
        (lead) =>
          matchesLead(lead) &&
          (!needle ||
            [lead.company, lead.name].join(" ").toLowerCase().includes(needle)),
      ),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipeline, query, filters, currentUser]);

  return (
    <div className="page-stack">
      <div className="page-header">
        <PageHeader
          title="Pipeline"
          eyebrow="Manage and track your leads across the pipeline stages."
        />
        <div className="pipeline-toolbar">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search leads..."
          />
          <button
            type="button"
            className={`pipeline-filter-btn ${activeFilterCount ? "is-active" : ""}`}
            onClick={() => setShowFilters((v) => !v)}
          >
            <Filter size={16} />
            Filter
            {activeFilterCount > 0 && (
              <span className="filter-count-badge">{activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      {showFilters && (
        <section className="surface pipeline-filter-panel">
          <div className="pipeline-filter-grid">
            <label>
              <span>Stage</span>
              <select value={filters.stage} onChange={(e) => setFilter("stage", e.target.value)}>
                <option>All</option>
                {pipelineStages.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Owner</span>
              <select value={filters.owner} onChange={(e) => setFilter("owner", e.target.value)}>
                <option>All</option>
                <option>Assigned</option>
                <option>Me</option>
                <option>Unassigned</option>
              </select>
            </label>
            <label>
              <span>Lead Source</span>
              <select value={filters.source} onChange={(e) => setFilter("source", e.target.value)}>
                {sources.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Lead Value</span>
              <div className="filter-range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minValue}
                  onChange={(e) => setFilter("minValue", e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxValue}
                  onChange={(e) => setFilter("maxValue", e.target.value)}
                />
              </div>
            </label>
            <label>
              <span>Created Date</span>
              <select
                value={filters.createdWithin}
                onChange={(e) => setFilter("createdWithin", e.target.value)}
              >
                {DATE_RANGES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Last Activity</span>
              <select
                value={filters.activityWithin}
                onChange={(e) => setFilter("activityWithin", e.target.value)}
              >
                {DATE_RANGES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Priority</span>
              <select value={filters.priority} onChange={(e) => setFilter("priority", e.target.value)}>
                <option>All</option>
                {priorities.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Industry</span>
              <select value={filters.industry} onChange={(e) => setFilter("industry", e.target.value)}>
                {industries.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="pipeline-filter-actions">
            <button type="button" className="pipeline-filter-btn" onClick={clearFilters}>
              <X size={14} />
              Clear filters
            </button>
          </div>
        </section>
      )}

      <section className="pipeline-board">
        {filteredPipeline.map((column) => {
          const meta = STAGE_META[column.stage] || { icon: Clock, colorClass: "stage-6" };
          const Icon = meta.icon;
          return (
            <article
              key={column.stage}
              className="pipeline-column"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => onDrop(event, column.stage)}
            >
              <div className={`pipeline-head ${meta.colorClass}`}>
                <strong>{column.stage}</strong>
                <span>
                  {column.leads.length} Lead{column.leads.length !== 1 ? "s" : ""}
                  {" \u2022 "}
                  {formatCurrency(
                    column.leads.reduce((sum, l) => sum + Number(l.value || 0), 0),
                  )}
                </span>
              </div>
              <div className="pipeline-cards">
                {column.leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="deal-card"
                    draggable
                    onDragStart={(event) =>
                      event.dataTransfer.setData("text/plain", lead.id)
                    }
                  >
                    <div className="deal-card-head">
                      <strong>{lead.company}</strong>
                      <GripVertical size={14} />
                    </div>
                    <span className="deal-value">{formatCurrency(lead.value)}</span>
                    <span>{lead.name}</span>
                    <div className="deal-meta">
                      <small>{dayjs(lead.updatedAt || lead.createdAt).fromNow()}</small>
                      <Icon size={14} />
                    </div>
                  </div>
                ))}
                {column.leads.length === 0 && (
                  <div className="empty-cell">No leads in this stage</div>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

export default PipelinePage;
