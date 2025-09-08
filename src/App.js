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

// Upload Page
function UploadPage() {
  const [form, setForm] = useState({ name: "", email: "", description: "" });
  const [resume, setResume] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleFile = (e) => setResume(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", form.name);
    data.append("email", form.email);
    data.append("description", form.description);
    if (resume) data.append("resume", resume);
    await axios.post("https://fazalkhan6283683-resume.hf.space/items", data);
    navigate(`/resume-agent/${form.email}`);
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
        <button className="upload-btn" type="submit">
          Upload
        </button>
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

// Wrapper to pass userId param to ChatBotPage
function ChatBotPageWrapper() {
  const { userId } = useParams();
  return <ChatBotPage userId={userId} />;
}

export default App;
