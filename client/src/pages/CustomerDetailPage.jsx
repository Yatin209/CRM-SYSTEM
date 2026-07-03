import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { http } from "../api/http";
import PageHeader from "../components/common/PageHeader";
import Badge from "../components/common/Badge";
import ComposeEmailModal from "../components/common/composeEmailModal";
import { getCustomerHistory } from "../services/communicationService";
import { statusTone } from "../utils/formatters";
import { toast } from "react-toastify";
import AddNoteModal from "../components/common/AddNoteModal.jsx";

function CustomerDetailsPage() {
  const { id } = useParams();

  const [customer, setCustomer] = useState(null);

  const [loading, setLoading] = useState(true);
  const [openCompose, setOpenCompose] = useState(false);
  const [openAddNote, setOpenAddNote] = useState(false);
  const [openNote, setOpenNote] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadCustomer();
    loadHistory();
  }, [id]);

  async function loadCustomer() {
    try {
      const response = await http.get(`/customers/${id}`);

      setCustomer(response.data.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to load customer details",
      );
    } finally {
      setLoading(false);
    }
  }
  async function loadHistory() {
    try {
      const data = await getCustomerHistory(id);

      setHistory(data);
    } catch (err) {
      toast.error("Unable to load communication history");
    }
  }
  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!customer) {
    return <h2>Customer not found</h2>;
  }

  return (
    <div className="page-stack">
      <PageHeader title={customer.company} eyebrow="Customer Details" />

      <section className="surface">
        <div className="details-grid">
          <div>
            <strong>Customer Name</strong>
            <p>{customer.name}</p>
          </div>

          <div>
            <strong>Email</strong>
            <p>{customer.email}</p>
          </div>

          <div>
            <strong>Phone</strong>
            <p>{customer.phone}</p>
          </div>

          <div>
            <strong>Owner</strong>
            <p>{customer.owner}</p>
          </div>

          <div>
            <strong>Status</strong>
            <Badge tone={statusTone(customer.status)}>{customer.status}</Badge>
          </div>

          <div>
            <strong>Value</strong>
            <p>₹ {customer.value}</p>
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

          <button
            className="btn btn-secondary "
            onClick={() => setOpenNote(true)}
          >
            Add Note
          </button>
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
              {item.body && <p
              style={{
                margin: "10px 0", 
                whiteSpace: "pre-wrap",
              }}>{item.body}</p>}
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
        customer={customer}
        onClose={() => setOpenCompose(false)}
        onSuccess={() => {
          loadHistory();
        }}
      />
      <AddNoteModal
        open={openNote}
        customer={customer}
        onClose={() => setOpenNote(false)}
        onSuccess={loadHistory}
      />
    </div>
  );
}

export default CustomerDetailsPage;
