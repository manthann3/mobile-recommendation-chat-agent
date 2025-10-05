import React from "react";

export default function InputArea({
  inputRef,
  message,
  setMessage,
  placeholder,
  onSend,
  loading,
  onCancel,
}) {
  function handleKey(e) {
    if (e.key === "Enter" && !loading && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        background: "white",
        padding: "1rem",
        borderRadius: "0.875rem",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 12px -2px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <textarea
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          rows={1}
          style={{
            width: "85%",
            padding: "0.875rem 1.125rem",
            borderRadius: "0.75rem",
            border: "1px solid #e2e8f0",
            resize: "none",
            fontSize: "0.9rem",
            outline: "none",
            minHeight: "48px",
            maxHeight: "120px",
            lineHeight: "1.5",
            fontFamily: "inherit",
            transition: "all 0.2s ease",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#3b82f6";
            e.currentTarget.style.boxShadow = "0 0 0 2px rgba(59,130,246,0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <div
          style={{
            fontSize: "0.7rem",
            color: "#94a3b8",
            marginTop: "0.375rem",
            paddingLeft: "0.25rem",
          }}
        >
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          marginBottom: "15px",
          height: "48px",
        }}
      >
        {loading ? (
          <>
            <button
              onClick={onCancel}
              style={{
                padding: "0 1.25rem",
                borderRadius: "0.75rem",
                background: "#ef4444",
                color: "white",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                height: "48px",
                fontSize: "0.875rem",
                minWidth: "80px",
              }}
            >
              Cancel
            </button>
            <button
              disabled
              style={{
                padding: "0 1.5rem",
                borderRadius: "0.75rem",
                background: "#cbd5e1",
                color: "white",
                fontWeight: 600,
                border: "none",
                cursor: "not-allowed",
                height: "48px",
                fontSize: "0.875rem",
                minWidth: "80px",
                opacity: 0.6,
              }}
            >
              <div className="button-spinner"></div>
            </button>
          </>
        ) : (
          <button
            onClick={() => onSend(message)}
            disabled={!message.trim()}
            style={{
              padding: "0 1.5rem",
              borderRadius: "0.75rem",
              background: !message.trim()
                ? "#cbd5e1"
                : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              color: "white",
              fontWeight: 600,
              border: "none",
              cursor: !message.trim() ? "not-allowed" : "pointer",
              minWidth: "80px",
              height: "48px",
              opacity: !message.trim() ? 0.6 : 1,
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            Send
          </button>
        )}
      </div>

      <style jsx>{`
        .button-spinner {
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
