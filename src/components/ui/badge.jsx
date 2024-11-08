const Badge = ({ children, variant = "default", className = "" }) => {
  const variantStyles = {
    default: "bg-gray-100 text-gray-800",
    secondary: "bg-gray-200 text-gray-600",
  };

  return (
    <span className={`
      px-2 py-0.5 text-xs rounded-full
      ${variantStyles[variant] || variantStyles.default}
      ${className}
    `}>
      {children}
    </span>
  );
};

export { Badge };