import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { addInternalNote } from "../../services/communicationService";

function AddNoteModal({ open, customer, lead, onClose, onSuccess }) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setNote("");
      setLoading(false);
    }
  }, [open]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        note,
      };

      if (customer) {
        payload.customerId = customer._id || customer.id;
      }

      if (lead) {
        payload.leadId = lead._id || lead.id;
      }

      await addInternalNote(payload);

      toast.success("Note added successfully");

      onSuccess?.();

      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to add note");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add Internal Note</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Note</label>

            <textarea
              rows={6}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !note.trim()}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddNoteModal;
