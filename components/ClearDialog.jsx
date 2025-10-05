import React from "react";

export default function ClearDialog({ onCancel, onConfirm }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          padding: "1.5rem",
          borderRadius: "0.875rem",
          background: "white",
          boxShadow: "0 20px 40px -12px rgba(0,0,0,0.25)",
        }}
      >
        <h3
          style={{
            margin: "0 0 1rem 0",
            color: "#1e293b",
            fontSize: "1.125rem",
            fontWeight: 600,
          }}
        >
          Clear conversation?
        </h3>
        <p
          style={{
            color: "#64748b",
            margin: "0 0 1.5rem 0",
            lineHeight: 1.5,
            fontSize: "0.875rem",
          }}
        >
          This will remove your current chat history. This action cannot be
          undone.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "0.625rem 1.125rem",
              borderRadius: "0.625rem",
              border: "1px solid #e2e8f0",
              background: "white",
              color: "#64748b",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.8125rem",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "0.625rem 1.125rem",
              borderRadius: "0.625rem",
              background: "#ef4444",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.8125rem",
            }}
          >
            Clear Chat
          </button>
        </div>
      </div>
    </div>
  );
}
