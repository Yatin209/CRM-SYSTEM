const toneClass = {
  success: "badge-soft-success",
  warning: "badge-soft-warning",
  danger: "badge-soft-danger",
  primary: "badge-soft-primary",
  info: "badge-soft-info",
  neutral: "badge-soft-neutral"
};

function Badge({ children, tone = "neutral", className = "", style }) {
  return <span className={`badge-soft ${toneClass[tone] || toneClass.neutral} ${className}`} style={style}>{children}</span>;
}

export default Badge;
