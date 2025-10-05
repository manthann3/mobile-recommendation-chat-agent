import React from "react";
import MessageBubble from "./MessageBubble";


export default function Conversation({
  refScroll,
  conversation = [],
  loading = false,
}) {
  return (
    <div
      ref={refScroll}
      style={{
        height: "520px",
        overflowY: "auto",
        padding: "1.25rem",
        borderRadius: "0.875rem",
        background: "white",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        marginBottom: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      {conversation.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "#94a3b8",
            margin: "auto",
            maxWidth: "400px",
          }}
        >
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>📱</div>
          <h3
            style={{
              margin: "0 0 0.75rem 0",
              color: "#1e293b",
              fontSize: "1.125rem",
              fontWeight: "600",
            }}
          >
            Compare Phones & Get Recommendations
          </h3>
          <div
            style={{ lineHeight: "1.6", color: "#64748b", fontSize: "0.9rem" }}
          >
            Ask me to compare multiple phones, find the best options for your
            budget, or get detailed specifications and recommendations.
          </div>
        </div>
      ) : (
        conversation.map((msg, idx) => <MessageBubble key={idx} msg={msg} />)
      )}

      {loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            gap: "0.75rem",
          }}
        >
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
              fontWeight: "600",
            }}
          >
            AI
          </div>
          <div
            style={{
              padding: "0.875rem 1.125rem",
              borderRadius: "1rem",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontSize: "0.9rem",
            }}
          >
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>Getting response...</span>
          </div>
        </div>
      )}
      <style jsx>{`
        .loading-dots {
          display: inline-flex;
          gap: 0.25rem;
        }
        .loading-dots span {
          width: 0.375rem;
          height: 0.375rem;
          border-radius: 50%;
          background: #64748b;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .loading-dots span:nth-child(1) {
          animation-delay: -0.32s;
        }
        .loading-dots span:nth-child(2) {
          animation-delay: -0.16s;
        }
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
