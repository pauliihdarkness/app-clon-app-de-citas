import React from "react";
import "../../assets/styles/global.css";

const TextArea = ({
    placeholder = "",
    value,
    onChange,
    className = "",
    maxLength = 500,
    rows = 4,
    ...rest
}) => {

    const containerStyle = {
        position: "relative",
        width: "100%",
        marginBottom: "1rem"
    };

    const textareaStyle = {
        width: "100%",
        padding: "12px 16px",
        borderRadius: "var(--border-radius)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        background: "rgba(255, 255, 255, 0.05)",
        color: "white",
        fontSize: "1rem",
        outline: "none",
        transition: "all 0.3s ease",
        resize: "vertical",
        fontFamily: "var(--font-family)"
    };

    const counterStyle = {
        position: "absolute",
        bottom: "-20px",
        right: "0",
        fontSize: "0.8rem",
        color: "var(--text-secondary)"
    };

    return (
        <div style={containerStyle}>
            <textarea
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                maxLength={maxLength}
                rows={rows}
                className={`textarea ${className}`}
                style={textareaStyle}
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
            <div style={counterStyle}>
                {value.length} / {maxLength}
            </div>
        </div>
    );
};

export default TextArea;
