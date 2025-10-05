import React from "react";

export default function Header({ conversationExists, onClear }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "1.5rem",
        flexWrap: "wrap",
        gap: "1rem",
      }}
    >
      <div style={{ flex: 1 }}>
        <h1
          style={{
            margin: "0 0 0.5rem 0",
            fontSize: "1.75rem",
            color: "#1e293b",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span style={{ fontSize: "1.5em" }}>📱</span>
          Mobile Comparison Assistant
        </h1>
        <div
          style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: "1.5" }}
        >
          Compare phones, get recommendations, and find the perfect device for
          your needs
        </div>
      </div>

      {conversationExists && (
        <button
          onClick={onClear}
          style={{
            padding: "0.625rem 1.125rem",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "0.625rem",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.8125rem",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
          }}
        >
          Clear Chat
        </button>
      )}
    </div>
  );
}
