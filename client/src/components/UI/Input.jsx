import React from "react";
import "../../assets/styles/global.css";

const Input = ({
  type = "text",
  placeholder = "",
  value,
  onChange,
  className = "",
  icon = null,
  ...rest
}) => {

  const containerStyle = {
    position: "relative",
    width: "100%",
    marginBottom: "1rem"
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    paddingLeft: icon ? "40px" : "16px",
    borderRadius: "var(--border-radius)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(255, 255, 255, 0.05)",
    color: "white",
    fontSize: "1rem",
    outline: "none",
    transition: "all 0.3s ease",
  };

  const iconStyle = {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "rgba(255, 255, 255, 0.5)",
    pointerEvents: "none"
  };

  return (
    <div style={containerStyle}>
      {icon && <span style={iconStyle}>{icon}</span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`input ${className}`}
        style={inputStyle}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--primary-color)";
          e.target.style.boxShadow = "0 0 0 2px rgba(254, 60, 114, 0.2)";
          e.target.style.background = "rgba(255, 255, 255, 0.1)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
          e.target.style.boxShadow = "none";
          e.target.style.background = "rgba(255, 255, 255, 0.05)";
        }}
        {...rest}
      />
    </div>
  );
};

export default Input;