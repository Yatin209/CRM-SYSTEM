import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { http } from "../api/http";
import PageHeader from "../components/common/PageHeader";
import Badge from "../components/common/Badge";
import ComposeEmailModal from "../components/common/composeEmailModal";
import { getLeadHistory } from "../services/communicationService";
import { statusTone } from "../utils/formatters";
import { toast } from "react-toastify";
import { useCrmData } from "../context/CrmDataContext.jsx";
import { leadStatuses } from "../data/mockData.js";

function LeadDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { convertLead, updateLead } = useCrmData();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openCompose, setOpenCompose] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadLead();
    loadHistory();
  }, [id]);

  async function loadLead() {
    try {
      const response = await http.get(`/leads/${id}`);
      setLead(response.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to load lead details");
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    try {
      const data = await getLeadHistory(id);
      setHistory(data);
    } catch (err) {
      toast.error("Unable to load communication timeline");
    }
  }
  async function handleConvert() {
    const confirmed = window.confirm("Convert this lead into a customer?");

    if (!confirmed) {
      e.target.value = lead.status;
      return;
    }

    try {
      const result = await convertLead(id);

      if (result?.customer) {
        navigate(`/customers/${result.customer._id || result.customer.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  }
  async function handleStatusChange(e) {
    const status = e.target.value;

    if (status === "Converted") {
      const confirmed = window.confirm("Convert this lead into a customer?");

      if (!confirmed) {
        e.target.value = lead.status;
        return;
      }

      try {
        const result = await convertLead(id);

        if (result?.customer) {
          navigate(`/customers/${result.customer._id || result.customer.id}`);
        }
      } catch (err) {
        console.error(err);
      }

      return;
    }

    try {
      await updateLead(id, {
        status,
      });

      setLead((prev) => ({
        ...prev,
        status,
      }));
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <h2>Loading...</h2>;

  if (!lead) return <h2>Lead not found</h2>;

  return (
    <div className="page-stack">
      <PageHeader title={lead.company} eyebrow="Lead Details" />

      <section className="surface">
        <div className="details-grid">
          <div>
            <strong>Name</strong>
            <p>{lead.name}</p>
          </div>

          <div>
            <strong>Email</strong>
            <p>{lead.email}</p>
          </div>

          <div>
            <strong>Phone</strong>
            <p>{lead.phone}</p>
          </div>

          <div>
            <strong>Status</strong>
            <Badge tone={statusTone(lead.status)}>{lead.status}</Badge>
          </div>

          <div>
            <strong>Source</strong>
            <p>{lead.source}</p>
          </div>

          <div>
            <strong>Owner</strong>
            <p>{lead.owner}</p>
          </div>
        </div>

        <div
          style={{
            marginTop: 30,
            display: "flex",
            gap: 15,
          }}
        >
          <button
            className="btn btn-primary"
            onClick={() => setOpenCompose(true)}
          >
            Send Email
          </button>

          <select
            className="form-select"
            value={lead.status}
            onChange={handleStatusChange}
            style={{
              width: "220px",
            }}
          >
            {leadStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="surface">
        <h3>Communication Timeline</h3>

        {history.length === 0 ? (
          <p>No communication found.</p>
        ) : (
          history.map((item) => (
            <div
              key={item._id}
              style={{
                padding: "15px",
                borderBottom: "1px solid #eee",
              }}
            >
              <h4>{item.subject}</h4>
              {item.body && (
                <p
                  style={{
                    margin: "10px 0",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {item.body}
                </p>
              )}
              <p>
                <strong>Outcome :</strong> {item.outcome}
              </p>

              <p>
                <strong>Owner :</strong> {item.owner}
              </p>

              <p>{new Date(item.date).toLocaleString()}</p>
            </div>
          ))
        )}
      </section>

      <ComposeEmailModal
        open={openCompose}
        lead={lead}
        onClose={() => setOpenCompose(false)}
        onSuccess={loadHistory}
      />
    </div>
  );
}

export default LeadDetailsPage;
