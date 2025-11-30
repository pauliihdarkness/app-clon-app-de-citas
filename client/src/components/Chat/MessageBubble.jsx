import React from "react";

const MessageBubble = React.memo(({
    message,
    isOwn,
    showAvatar,
    formattedTime,
    otherUserImage,
    index
}) => {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: isOwn ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: "0.5rem",
                animation: `fadeIn 0.3s ease ${index * 0.05}s both`
            }}
        >
            {/* Avatar placeholder for alignment */}
            {!isOwn && (
                <div style={{
                    width: "32px",
                    height: "32px",
                    flexShrink: 0,
                    visibility: showAvatar ? "visible" : "hidden"
                }}>
                    {showAvatar && (
                        <div style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            overflow: "hidden",
                            background: "var(--primary-gradient)",
                            position: "relative"
                        }}>
                            {otherUserImage ? (
                                <img
                                    src={otherUserImage}
                                    alt="Avatar"
                                    loading="lazy"
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover"
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.9rem"
                                }}>
                                    👤
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Message bubble */}
            <div style={{
                maxWidth: "70%",
                position: "relative"
            }}>
                <div style={{
                    background: isOwn ? "var(--primary-gradient)" : "rgba(255, 255, 255, 0.1)",
                    padding: "0.75rem 1rem",
                    borderRadius: isOwn
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    boxShadow: isOwn
                        ? "0 2px 8px rgba(254, 60, 114, 0.3)"
                        : "0 2px 8px rgba(0, 0, 0, 0.1)",
                    position: "relative"
                }}>
                    <p style={{
                        margin: 0,
                        color: "white",
                        wordWrap: "break-word",
                        lineHeight: "1.4"
                    }}>
                        {message}
                    </p>
                    {formattedTime && (
                        <span style={{
                            fontSize: "0.7rem",
                            opacity: 0.7,
                            marginTop: "0.25rem",
                            display: "block",
                            textAlign: isOwn ? "right" : "left",
                            color: "white"
                        }}>
                            {formattedTime}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function - only re-render if message content changes
    return (
        prevProps.message === nextProps.message &&
        prevProps.isOwn === nextProps.isOwn &&
        prevProps.showAvatar === nextProps.showAvatar &&
        prevProps.formattedTime === nextProps.formattedTime &&
        prevProps.otherUserImage === nextProps.otherUserImage &&
        prevProps.index === nextProps.index
    );
});

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;
