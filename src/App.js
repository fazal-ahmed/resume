import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import axios from "axios";
import ChatBotPage from "./ChatBotPage";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, "") || "";

// Upload Page
function UploadPage() {
  const [form, setForm] = useState({ name: "", email: "", description: "" });
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);   // <-- new state
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => setResume(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // show loader

    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("email", form.email);
      data.append("description", form.description);
      if (resume) data.append("resume", resume);

      await axios.post(`${API_BASE}/items`, data);
      navigate(`/resume-agent/${form.email}`);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false); // hide loader no matter what
    }
  };

  return (
    <div className="upload-root">
      <h2>Upload Resume</h2>

      <form onSubmit={handleSubmit} className="upload-form">
        <input
          className="upload-input"
          name="name"
          placeholder="Name"
          onChange={handleChange}
          required
        />
        <input
          className="upload-input"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <textarea
          className="upload-textarea"
          name="description"
          placeholder="Description"
          onChange={handleChange}
        />
        <input
          className="upload-file"
          type="file"
          accept="application/pdf"
          onChange={handleFile}
        />

        <button className="upload-btn" type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>

        {loading && (
          <div className="loader">
            {/* simple spinner — style with CSS */}
            <div className="spinner" />
            <p>Uploading your resume…</p>
          </div>
        )}
      </form>
    </div>
  );
}

// Main App with Routing
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/resume-agent/:userId" element={<ChatBotPageWrapper />} />
      </Routes>
    </Router>
  );
}

function ChatBotPageWrapper() {
  const { userId } = useParams();
  return <ChatBotPage userId={userId} />;
}

export default App;
