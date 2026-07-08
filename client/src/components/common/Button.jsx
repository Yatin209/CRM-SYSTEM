function Button({ children, icon: Icon, variant = "primary", size = "md", className = "", type = "button", ...props }) {
  return (
    <button type={type} className={`btn-nexa btn-${variant} btn-${size} ${className}`} {...props}>
      {Icon ? <Icon size={16} strokeWidth={2.2} /> : null}
      <span>{children}</span>
    </button>
  );
}

export default Button;
