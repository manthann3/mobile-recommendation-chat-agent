import React from "react";
import ComparisonTable from "./ComparisonTable";
import { parseTableFromText } from "./utils";

export default function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const tableRows = !isUser ? parseTableFromText(msg.content || "") : null;

  function renderAIContent(text) {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} style={{ height: "0.5rem" }} />;
      if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
        return (
          <div
            key={idx}
            style={{
              margin: "0.25rem 0",
              paddingLeft: "1rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
            }}
          >
            <span style={{ color: "#2563eb", flexShrink: 0 }}>•</span>
            <span>{trimmed.replace(/^(- |• )/, "")}</span>
          </div>
        );
      }
      if (
        trimmed.includes(":") &&
        !trimmed.startsWith("#") &&
        trimmed.length < 100
      ) {
        const [key, ...valueParts] = trimmed.split(":");
        const value = valueParts.join(":").trim();
        return (
          <div key={idx} style={{ margin: "0.5rem 0" }}>
            <strong style={{ color: "#1e293b" }}>{key.trim()}:</strong>
            <span style={{ color: "#475569", marginLeft: "0.5rem" }}>
              {value}
            </span>
          </div>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h3
            key={idx}
            style={{
              margin: "1rem 0 0.5rem 0",
              color: "#1e293b",
              fontSize: "1.1rem",
              fontWeight: 600,
            }}
          >
            {trimmed.replace("## ", "")}
          </h3>
        );
      }
      if (trimmed.startsWith("# ")) {
        return (
          <h2
            key={idx}
            style={{
              margin: "1.25rem 0 0.75rem 0",
              color: "#1e293b",
              fontSize: "1.25rem",
              fontWeight: 700,
            }}
          >
            {trimmed.replace("# ", "")}
          </h2>
        );
      }
      return (
        <div
          key={idx}
          style={{ margin: "0.75rem 0", lineHeight: "1.6", color: "#374151" }}
        >
          {trimmed}
        </div>
      );
    });
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        alignItems: "flex-start",
        gap: "0.75rem",
      }}
    >
      {!isUser && (
        <div
          style={{
            width: "2rem",
            height: "2rem",
            borderRadius: "50%",
            background: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: "0.75rem",
            color: "#64748b",
            fontWeight: 600,
          }}
        >
          AI
        </div>
      )}
      <div
        style={{
          maxWidth: "82%",
          padding: "0.875rem 1.125rem",
          borderRadius: "1rem",
          background: isUser
            ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
            : "#f8fafc",
          color: isUser ? "white" : "#1e293b",
          boxShadow: isUser
            ? "0 2px 8px rgba(59, 130, 246, 0.2)"
            : "0 1px 4px rgba(0,0,0,0.06)",
          border: isUser ? "none" : "1px solid #e2e8f0",
          lineHeight: "1.5",
          fontSize: "0.9rem",
        }}
      >
        {isUser ? (
          <div>{msg.content}</div>
        ) : (
          <div style={{ width: "100%" }}>
            {tableRows && tableRows.length > 0 ? (
              <ComparisonTable rows={tableRows} />
            ) : (
              renderAIContent(msg.content)
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "0.75rem",
                paddingTop: "0.5rem",
                borderTop: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <span
                style={{ fontSize: "0.7rem", color: "#94a3b8", opacity: 0.7 }}
              >
                {msg.timestamp
                  ? new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </span>
            </div>
          </div>
        )}
      </div>
      {isUser && (
        <div
          style={{
            width: "2rem",
            height: "2rem",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: "0.75rem",
            color: "white",
            fontWeight: 600,
          }}
        >
          You
        </div>
      )}
    </div>
  );
}
