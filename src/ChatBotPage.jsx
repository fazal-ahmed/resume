import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./ChatBotPage.css";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

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
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [listening, setListening] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

    try {
      const history = messages.map((m) => ({
        role: m.role === "agent" ? "model" : "user",
        content: m.content,
      }));

      const res = await axios.post(`https://fazalkhan6283683-resume.hf.space/chat/${userId}`, {
        message: messageText,
        history,
      });

      const reply = { role: "agent", content: res.data.answer, time: formatTime() };
      setMessages((msgs) => [...msgs, reply]);
      speak(res.data.answer); // 🎤 Speak out the answer
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

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      // setShowVoiceModal(false);
      const fakeEvent = { preventDefault: () => {} };
      handleSend(fakeEvent, transcript);
    };

    recognition.onerror = (e) => console.error("Speech error:", e);
    recognition.onend = () => setListening(false);

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
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
          <div key={idx} className={`chat-message ${msg.role}`}>
            <div className="chat-bubble">{msg.content}</div>
            {msg.time && <span className="chat-time">{msg.time}</span>}
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

        <button
          type="button"
          className="chat-mic-btn"
          onClick={() => setShowVoiceModal(true)}
          disabled={loading}
          style={{ marginRight: "8px" }}
        >
          🎤
        </button>

        <button className="chat-send-btn" type="submit" disabled={loading}>
          Send
        </button>
      </form>

      {/* Voice Modal */}
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
    </div>
  );
}
