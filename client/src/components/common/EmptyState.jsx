import { Inbox } from "lucide-react";

function EmptyState({ title = "Nothing here yet" }) {
  return (
    <div className="empty-state">
      <Inbox size={24} />
      <strong>{title}</strong>
    </div>
  );
}

export default EmptyState;
