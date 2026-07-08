import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { sendEmail } from "../../services/communicationService";
import { http, unwrap } from "../../api/http";

function ComposeEmailModal({
  open,

  onClose,

  onSuccess,
}) {
  const [recipientType, setRecipientType] = useState("customer");

  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);

  const [recipientId, setRecipientId] = useState("");

  const [subject, setSubject] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadRecipients();
    }
  }, [open]);

  async function loadRecipients() {
    try {
      const [customerRes, leadRes] = await Promise.all([
        http.get("/customers"),
        http.get("/leads"),
      ]);
      const customerData = unwrap(customerRes);
      const leadData = unwrap(leadRes);
      setCustomers(customerData.items || customerData.records || customerData);
      setLeads(leadData.items || leadData.records || leadData);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      await sendEmail({
        customerId: recipientType === "customer" ? recipientId : undefined,
        leadId: recipientType === "lead" ? recipientId : undefined,

        subject,

        message,
      });

      onSuccess();

      onClose();
      setRecipientId("");
      setSubject("");
      setMessage("");
      toast.success("✓ Email sent successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return null;
  }

  const recipients = recipientType === "customer" ? customers : leads;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Compose Email</h2>

        <form onSubmit={handleSubmit}>
          <label>Send to</label>
          <select
            value={recipientType}
            onChange={(e) => {
              setRecipientType(e.target.value);
              setRecipientId("");
            }}
          >
            <option value="customer">Customer</option>
            <option value="lead">Lead</option>
          </select>

          <label>{recipientType === "customer" ? "Customer" : "Lead"}</label>

          <select
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            required
          >
            <option value="">
              Select {recipientType === "customer" ? "customer" : "lead"}
            </option>

            {recipients.map((r) => (
              <option key={r.id || r._id} value={r.id || r._id}>
                {r.name} — {r.company}
              </option>
            ))}
          </select>

          <label>Subject</label>

          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />

          <label>Message</label>

          <textarea
            rows={8}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ComposeEmailModal;
