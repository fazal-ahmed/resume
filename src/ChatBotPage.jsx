// ChatBotPage.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./ChatBotPage.css";

const userAvatar =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDlnfRnUKQY5xPtDwCWQ-ajAfQ28fjUXyv6t6gxqERSFSa491na_qdX12r0pOFBzKIJeEnwCdJp4cQdMfrmNT5o2odSSMPh5niAe-P16oyI7obfUxVlhEvakKKFPUw2zSLoZgvM53doppCC4uVtkgJ5ymdFcU16QBG3qjOd9F2a273Qq7hAEY7S6h43QQXQHUU9cdB4Ud1JmiY6fFl6GT0ErsR_5xekQRt0GwRBjI2Je3DVFoF6qHEW1psILGwcpw6reX5hEGYezA";
const agentAvatar =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAUzo8hPgN_iX4Gjmysd4eEsEYlZ0-ew9EZkRKnBBdtjbfo6kYfeia-h2diqEDMEfQhuS7OFVonhpk-FnlxSHBR379gMJTQ3PGTILrIDeTC5RhRoGWWH7cm4NOG0oArocau0GwSoVc5lH0XF0Rppz1sKKWwureDskeG3ZtWbY0Q_wOPnuISQWorogzkmnyfxCvRtNMkdzsJr6RcGzrbkPBWDwnuIOq2ZGq4K83HnV_Kvv3ZFrajhLHtiV2FredB3o_LlmyMHTIoXQ";

export default function ChatBotPage({ userId = "Sophia" }) {
  const [messages, setMessages] = useState([
    {
      role: "agent",
      content: "Hey, how can i help you?",
      time: "10:00 AM",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function formatTime(date = new Date()) {
    return date
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      .replace(/^0/, "");
  }

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = {
      role: "user",
      content: input,
      time: formatTime(),
    };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role === "agent" ? "model" : "user",
        content: m.content,
      }));
      const res = await axios.post(
        `http://localhost:8000/chat/${userId}`,
        {
          message: userMsg.content,
          history,
        }
      );
      setMessages((msgs) => [
        ...msgs,
        {
          role: "agent",
          content: res.data.answer,
          time: formatTime(),
        },
      ]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        {
          role: "agent",
          content: "Agent error: Could not get a response.",
          time: formatTime(),
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="chat-root">
      {/* Header */}
      <header className="chat-header">
        <h2>Resume Agent</h2>
        <span>Online</span>
      </header>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chat-message ${msg.role}`}
          >
            <div className="chat-bubble">{msg.content}</div>
            <span className="chat-time">{msg.time}</span>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input */}
      <form className="chat-input-row" onSubmit={handleSend}>
        <input
          className="chat-input"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button className="chat-send-btn" type="submit" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
}
