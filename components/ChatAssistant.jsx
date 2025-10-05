import React, { useEffect, useRef, useState } from "react";
import Header from "./Header";
import SuggestionChips from "./SuggestionChips";
import Conversation from "./Conversation";
import InputArea from "./InputArea";
import ClearDialog from "./ClearDialog";
import { parseTableFromText, formatCurrency } from "./utils";
import { sanitizeText } from "./utils";

export default function ChatAssistant({
  apiUrl = "/api/chat",
  useSDK = false,
  sdkClient = null,
  placeholder = "Ask about phones (budget, compare, features)...",
  suggestions = ["Best phone under ₹20,000", "Phones with best battery life"],
}) {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const scrollRef = useRef(null);
  const typingRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [conversation, loading]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (typingRef.current) clearInterval(typingRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const cancelRequest = () => {
    if (typingRef.current) {
      clearInterval(typingRef.current);
      typingRef.current = null;
    }
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setLoading(false);
  };

  async function sendMessage(raw) {
    const trimmed = (raw || message || "").trim();
    if (!trimmed) return;
    const userMsg = { role: "user", content: trimmed, timestamp: new Date() };
    setConversation((c) => [...c, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      abortControllerRef.current = new AbortController();
      let replyText;

      if (useSDK && sdkClient) {
        replyText = await sdkClient.sendMessage(trimmed, {
          signal: abortControllerRef.current.signal,
        });
      } else {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        replyText =
          data?.response ||
          data?.reply ||
          data?.error ||
          "No response from server.";
      }
      await showTypewriterReply(sanitizeText(replyText));
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Request cancelled");
        return;
      }
      console.error("Send message error:", err);
      const errorMsg = {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again.",
        timestamp: new Date(),
      };
      setConversation((c) => [...c, errorMsg]);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }

  function showTypewriterReply(fullText) {
    if (Array.isArray(fullText)) {
      fullText = fullText
        .map((part) => (typeof part === "string" ? part : part?.text || ""))
        .join("");
    } else if (typeof fullText !== "string") {
      fullText =
        fullText?.text || fullText?.message || JSON.stringify(fullText) || "";
    }

    return new Promise((resolve) => {
      const startMsg = {
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };
      setConversation((c) => [...c, startMsg]);

      let i = 0;
      const speed = Math.max(5, Math.min(20, 200 - fullText.length * 0.05));

      typingRef.current = setInterval(() => {
        i += 1;
        const partial = fullText.slice(0, i);

        setConversation((prev) => {
          const copy = [...prev];
          const lastMsg = copy[copy.length - 1];

          if (lastMsg.role === "assistant") {
            copy[copy.length - 1] = { ...lastMsg, content: partial };
          } else {
            copy.push({
              role: "assistant",
              content: partial,
              timestamp: new Date(),
            });
          }

          return copy;
        });

        if (i >= fullText.length) {
          clearInterval(typingRef.current);
          typingRef.current = null;
          resolve();
        }
      }, speed);
    });
  }

  function clearChatConfirmed() {
    setConversation([]);
    setShowConfirmClear(false);
    if (inputRef.current) inputRef.current.focus();
  }

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "1.5rem auto",
        padding: "0 1rem",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <Header
        conversationExists={conversation.length > 0}
        onClear={() => setShowConfirmClear(true)}
      />
      {conversation.length === 0 && (
        <SuggestionChips
          suggestions={suggestions}
          onPick={(s) => {
            setMessage(s);
            inputRef.current?.focus();
          }}
        />
      )}
      <Conversation
        refScroll={scrollRef}
        conversation={conversation}
        loading={loading}
        formatCurrency={formatCurrency}
      />
      <InputArea
        inputRef={inputRef}
        message={message}
        setMessage={setMessage}
        placeholder={placeholder}
        onSend={sendMessage}
        loading={loading}
        onCancel={cancelRequest}
      />
      {showConfirmClear && (
        <ClearDialog
          onCancel={() => setShowConfirmClear(false)}
          onConfirm={clearChatConfirmed}
        />
      )}
    </div>
  );
}
