import React from "react";
import "../../assets/styles/global.css";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  icon = null,
  disabled = false
}) => {

  const getVariantStyle = () => {
    switch (variant) {
      case "primary":
        return {
          background: "var(--primary-gradient)",
          color: "white",
          border: "none"
        };
      case "secondary":
        return {
          background: "rgba(255, 255, 255, 0.1)",
          color: "white",
          border: "1px solid rgba(255, 255, 255, 0.2)"
        };
      case "outline":
        return {
          background: "transparent",
          color: "var(--primary-color)",
          border: "2px solid var(--primary-color)"
        };
      case "social":
        return {
          background: "white",
          color: "#333",
          border: "none"
        };
      default:
        return {};
    }
  };

  const baseStyle = {
    padding: "12px 24px",
    borderRadius: "var(--border-radius)",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    transition: "all 0.3s ease",
    opacity: disabled ? 0.7 : 1,
    width: "100%",
    ...getVariantStyle()
  };

  return (
    <button
      type={type}
      className={`button ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={baseStyle}
      onMouseOver={(e) => {
        if (!disabled && variant === 'primary') {
          e.currentTarget.style.background = "var(--hover-gradient)";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(254, 60, 114, 0.4)";
        }
      }}
      onMouseOut={(e) => {
        if (!disabled && variant === 'primary') {
          e.currentTarget.style.background = "var(--primary-gradient)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;