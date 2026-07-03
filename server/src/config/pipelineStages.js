// Single source of truth for Lead statuses / Pipeline stages.
// The Pipeline board and the Lead status dropdown must always show the
// exact same set of values — so both are derived from this file instead
// of being hardcoded separately in multiple places.

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Requirement Analysis",
  "Proposal Sent",
  "Negotiation",
  "Converted",
  "Lost",
];

// Pipeline board columns. "Converted" leads are moved into the Customer
// section, so they no longer occupy a pipeline column — every other
// status doubles as a pipeline stage.
export const PIPELINE_STAGES = LEAD_STATUSES.filter(
  (status) => status !== "Converted",
);
