export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(value || 0);
}

// Readable date + time string, e.g. "03 Jul 2026, 10:30 AM"
export function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  const datePart = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart}, ${timePart}`;
}

export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

// Plain YYYY-MM-DD string, e.g. "2026-07-01" — used where the UI needs the
// raw ISO date format rather than a localized/human-readable one.
export function formatPlainDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function statusTone(status) {
  if (["Active", "Converted", "Completed", "Won", "Positive"].includes(status))
    return "success";
  if (["High", "At Risk", "Lost", "Watch"].includes(status)) return "danger";
  if (
    [
      "Medium",
      "Renewal",
      "In Progress",
      "Negotiation",
      "Proposal Sent",
      "Neutral",
    ].includes(status)
  )
    return "warning";
  if (["Qualified", "Interested", "Open", "Contacted"].includes(status))
    return "primary";
  return "neutral";
}
