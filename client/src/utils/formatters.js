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
  if (["Requirement Analysis", "Open", "Contacted"].includes(status))
    return "primary";
  return "neutral";
}
