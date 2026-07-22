import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./ChatBotPage.css";
import { debug, info, error as logError } from "./logger";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


const API_BASE =
  process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, "") || "";

export default function ChatBotPage({ userId = "Sophia" }) {
  const [messages, setMessages] = useState([
    { role: "agent", content: `Hey, how can I help you?` },
    {
      role: "agent",
      content: `I'm your personal resume assistant.\nYou can ask me questions about my professional career and skills.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  // voice feature temporarily commented out
  // const [showVoiceModal, setShowVoiceModal] = useState(false);
  // const [listening, setListening] = useState(false);
  const chatEndRef = useRef(null);
  // const recognitionRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    debug('ChatBotPage: messages changed', { count: messages.length });
  }, [messages]);

  const formatTime = () =>
    new Date()
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      .replace(/^0/, "");

  const speak = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    speechSynthesis.speak(utter);
  };

  const handleSend = async (e, overrideText) => {
    if (e) e.preventDefault();
    const messageText = overrideText ?? input;
    if (!messageText.trim()) return;

    const userMsg = { role: "user", content: messageText, time: formatTime() };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    debug('ChatBotPage: sending message', { userId, text: messageText });

    try {
      const history = messages.map((m) => ({
        role: m.role === "agent" ? "model" : "user",
        content: m.content,
      }));

      const res = await axios.post(`${API_BASE}/chat/${userId}`, {
        message: messageText,
        history,
      });

      const reply = { role: "agent", content: res.data.answer, time: formatTime() };
      info('ChatBotPage: received reply', { userId, answerPreview: (res.data.answer || '').slice(0,120) });
      setMessages((msgs) => [...msgs, reply]);
      speak(res.data.answer); // 🎤 Speak out the answer
    } catch (err) {
      logError('ChatBotPage: send error', err);
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

  // Voice feature handlers removed while disabled to avoid unused-vars lint errors

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
          <div key={idx} className={`chat-message ${msg.role}`}>
            <div className="chat-bubble">
              {msg.role === 'agent' ? (
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
            {msg.time && <span className="chat-time">{msg.time}</span>}
          </div>
        ))}
        {loading && (
          <div className={`chat-message agent chat-typing`}>
            <div className="chat-bubble">Agent is typing<span className="typing-dots">...</span></div>
          </div>
        )}
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

        {/* microphone/voice UI temporarily commented out
        <button
          type="button"
          className="chat-mic-btn"
          onClick={() => setShowVoiceModal(true)}
          disabled={loading}
          style={{ marginRight: "8px" }}
        >
          🎤
        </button>
        */}

        <button className="chat-send-btn" type="submit" disabled={loading}>
          Send
        </button>
      </form>

      {/* Voice Modal */}
      {/* voice modal temporarily disabled
      {showVoiceModal && (
        <div className="voice-modal">
          <div className="voice-box">
            <h3>Speak your query</h3>
            <p>{listening ? "Listening..." : "Click start to talk"}</p>
            <div style={{ marginTop: "12px" }}>
              {!listening ? (
                <button onClick={startListening} className="start-btn">
                  ▶ Start
                </button>
              ) : (
                <button onClick={stopListening} className="stop-btn">
                  ■ Stop
                </button>
              )}
              <button
                style={{ marginLeft: "10px" }}
                onClick={() => {
                  stopListening();
                  setShowVoiceModal(false);
                }}
              >
                ✖ Close
              </button>
            </div>
          </div>
        </div>
      )}
      */}
    </div>
  );
}
