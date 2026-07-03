import { GripVertical } from "lucide-react";
import Badge from "../components/common/Badge.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import { useCrmData } from "../context/CrmDataContext.jsx";
import { formatCurrency, statusTone } from "../utils/formatters.js";

function PipelinePage() {
  const { pipeline, updateLeadStage } = useCrmData();

  function onDrop(event, stage) {
    const leadId = event.dataTransfer.getData("text/plain");
    if (leadId) {
      updateLeadStage(leadId, stage);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader title="Pipeline" eyebrow="Deal board" />
      <section className="pipeline-board">
        {pipeline.map((column) => (
          <article
            key={column.stage}
            className="pipeline-column"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => onDrop(event, column.stage)}
          >
            <div className="pipeline-head">
              <strong>{column.stage}</strong>
              <span>{formatCurrency(column.value)}</span>
            </div>
            <div className="pipeline-cards">
              {column.leads.map((lead) => (
                <div
                  key={lead.id}
                  className="deal-card"
                  draggable
                  onDragStart={(event) => event.dataTransfer.setData("text/plain", lead.id)}
                >
                  <div className="deal-card-head">
                    <GripVertical size={16} />
                    {lead.category && <Badge tone="primary">{lead.category}</Badge>}
                  </div>
                  <strong>{lead.company}</strong>
                  <span>{lead.name}</span>
                  <div className="deal-meta">
                    <small>{formatCurrency(lead.value)}</small>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default PipelinePage;
