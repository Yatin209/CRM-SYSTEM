import { Mail, MessageCircle, Phone, TicketCheck, Video } from "lucide-react";
import Badge from "../components/common/Badge.jsx";
import DataTable from "../components/common/DataTable.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import { statusTone } from "../utils/formatters.js";
import { useEffect, useState } from "react";
import { getCommunications } from "../services/communicationService";

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

      setCommunications(data);
    } catch (err) {
      console.log(err);
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
      key: "subject",
      header: "Subject",
      render: (item) => (
        <div className="cell-title">
          <strong>{item.subject}</strong>
          <span>{item.linkedTo}</span>
        </div>
      ),
    },
    { key: "owner", header: "Owner" },
    { key: "date", header: "Date" },
    { key: "outcome", header: "Outcome" },
    {
      key: "sentiment",
      header: "Sentiment",
      render: (item) => (
        <Badge tone={statusTone(item.sentiment)}>{item.sentiment}</Badge>
      ),
    },
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title="Communications" eyebrow="customer conversation"
      />
      <section className="surface">
        <DataTable
          loading={loading}
          columns={columns}
          data={communications}
          emptyTitle="No communications found"
        />
      </section>
    </div>
  );
}

export default CommunicationsPage;