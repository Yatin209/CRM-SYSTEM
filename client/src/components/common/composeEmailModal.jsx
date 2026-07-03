/*
import { useEffect, useState } from "react";
import { sendEmail } from "../../services/communicationService";
import { toast } from "react-toastify";

function ComposeEmailModal({
  open,

  customer,

  lead,

  onClose,

  onSuccess,
}) {
  const [customers, setCustomers] = useState([]);

  const [customerId, setCustomerId] = useState("");

  const [subject, setSubject] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadCustomers();
    }
  }, [open]);

  async function loadCustomers() {
    try {
      const response = await http.get("/customers");

      const data = unwrap(response);

      setCustomers(data.items || data);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      await sendEmail({
        customerId,

        subject,

        message,
      });

      alert("Email Sent Successfully");

      onSuccess();

      onClose();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Compose Email</h2>

        <form onSubmit={handleSubmit}>
          <label>Customer</label>

          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
          >
            <option value="">Select Customer</option>

            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
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
*/

import { useEffect, useState } from "react";
import { sendEmail } from "../../services/communicationService";
import { toast } from "react-toastify";

function ComposeEmailModal({
  open,

  customer,

  lead,

  onClose,

  onSuccess,
}) {
  const [subject, setSubject] = useState("");

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!open) {
      setSubject("");

      setMessage("");

      setLoading(false);
    }
  }, [open]);
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        subject,

        message,
      };

      if (customer) {
        payload.customerId = customer._id || customer.id;
      }

      if (lead) {
        payload.leadId = lead._id || lead.id;
      }

      await sendEmail(payload);
      toast.success("Email sent successfully");

      onSuccess?.();

      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Compose Email</h2>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              marginBottom: 20,
            }}
          >
            <strong>To</strong>

            <p>{customer?.name || lead?.name}</p>

            <p>{customer?.email || lead?.email}</p>
          </div>

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
            <button
              type="submit"
              disabled={loading || !subject.trim() || !message.trim()}
            >
              {loading ? "Sending..." : "Send Email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ComposeEmailModal;