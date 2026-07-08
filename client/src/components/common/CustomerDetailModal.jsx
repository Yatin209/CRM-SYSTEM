import { Building2, Mail, MapPin, Phone, User } from "lucide-react";
import Badge from "./Badge.jsx";
import Button from "./Button.jsx";
import Modal from "./Modal.jsx";
import { formatCurrency } from "../../utils/formatters.js";

const statusTone = (status) => {
  if (status === "Active") return "success";
  if (status === "Renewal") return "info";
  if (status === "At Risk") return "danger";
  return "warning";
};

export default function CustomerDetailModal({ open, onClose, customer }) {
  if (!customer) return null;

  return (
    <Modal open={open} title="Customer Details" onClose={onClose}>
      <div className="customer-detail-content">
        <div className="customer-detail-header">
          <div>
            <h3>{customer.company}</h3>
            <p className="text-muted">{customer.name}</p>
          </div>
          <Badge tone={statusTone(customer.status)}>{customer.status}</Badge>
        </div>

        <div className="customer-detail-grid">
          <div className="detail-item">
            <div className="detail-label">
              <Mail size={16} />
              <span>Email</span>
            </div>
            <div className="detail-value">{customer.email}</div>
          </div>

          <div className="detail-item">
            <div className="detail-label">
              <Phone size={16} />
              <span>Phone</span>
            </div>
            <div className="detail-value">{customer.phone}</div>
          </div>

          <div className="detail-item">
            <div className="detail-label">
              <Building2 size={16} />
              <span>Industry</span>
            </div>
            <div className="detail-value">{customer.industry || "Other"}</div>
          </div>

          <div className="detail-item">
            <div className="detail-label">
              <User size={16} />
              <span>Owner</span>
            </div>
            <div className="detail-value">{customer.owner}</div>
          </div>

          {customer.address && (
            <div className="detail-item">
              <div className="detail-label">
                <MapPin size={16} />
                <span>Address</span>
              </div>
              <div className="detail-value">{customer.address}</div>
            </div>
          )}

          <div className="detail-item">
            <div className="detail-label">
              <span>Category</span>
            </div>
            <div className="detail-value">
              <Badge tone="primary">{customer.category}</Badge>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-label">
              <span>Value</span>
            </div>
            <div className="detail-value">
              <strong>{formatCurrency(customer.value)}</strong>
            </div>
          </div>
        </div>

        {customer.notes && (
          <div className="detail-item">
            <div className="detail-label">
              <span>Notes</span>
            </div>
            <div className="detail-value">{customer.notes}</div>
          </div>
        )}

        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
