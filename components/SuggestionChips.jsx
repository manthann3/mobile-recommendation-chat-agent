import React from "react";

export default function SuggestionChips({ suggestions = [], onPick }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onPick(suggestion)}
            style={{
              padding: "0.75rem 1.25rem",
              borderRadius: "2rem",
              background: "white",
              border: "1px solid #e2e8f0",
              color: "#475569",
              cursor: "pointer",
              fontSize: "0.8125rem",
              fontWeight: "500",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
