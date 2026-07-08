import { Mail, MessageCircle, Phone, TicketCheck, Video } from "lucide-react";
import { useEffect, useState } from "react";
import DataTable from "../components/common/DataTable.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import ComposeEmailModal from "../components/common/composeEmailModal.jsx";
import { getCommunications } from "../services/communicationService";
import { formatDateTime } from "../utils/formatters.js";

const icons = {
  Call: Phone,
  Email: Mail,
  WhatsApp: MessageCircle,
  Ticket: TicketCheck,
  Meeting: Video,
};

function CommunicationsPage() {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openComposeModal, setOpenComposeModal] = useState(false);

  useEffect(() => {
    loadCommunications();
  }, []);

  async function loadCommunications() {
    try {
      setLoading(true);
      const data = await getCommunications();
      setCommunications(Array.isArray(data) ? data : data?.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    {
      key: "type",
      header: "Channel",
      render: (item) => {
        const Icon = icons[item.type] || Mail;
        return (
          <span className="channel-pill">
            <Icon size={15} /> {item.type}
          </span>
        );
      },
    },
    {
      key: "receiver",
      header: "Receiver Name",
      render: (item) => (
        <div className="cell-title">
          <strong>{item.receiverName || item.linkedTo}</strong>
          {/* Linked lead/customer shown below the name — only when it adds
              information beyond the name already shown above. */}
          {item.receiverName && item.receiverName !== item.linkedTo && (
            <span>{item.linkedTo}</span>
          )}
        </div>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      render: (item) => item.subject,
    },
    { key: "owner", header: "Sent By" },
    {
      key: "date",
      header: "Date",
      render: (item) => formatDateTime(item.date),
    },
  ];

  return (
    <div className="page-stack">
      <div className="page-header">
        <PageHeader title="Communications" eyebrow="Customer conversations" />
        <button
          className="btn btn-primary"
          onClick={() => setOpenComposeModal(true)}
        >
          Compose Email
        </button>
      </div>
      <section className="surface">
        <DataTable
          loading={loading}
          columns={columns}
          data={communications}
          emptyTitle="No communications found"
        />
      </section>
      <ComposeEmailModal
        open={openComposeModal}
        onClose={() => setOpenComposeModal(false)}
        onSuccess={() => {
          loadCommunications();
        }}
      />
    </div>
  );
}

export default CommunicationsPage;
