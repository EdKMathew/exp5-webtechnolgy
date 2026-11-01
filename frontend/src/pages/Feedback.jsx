import { useEffect, useState } from "react";
import api from "../api";

// Only true in the throw-away demo copy, to show the XSS "before" state.
const UNSAFE_DEMO = import.meta.env.VITE_UNSAFE_DEMO === "true";

function Feedback() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = () =>
    api.get("/api/feedback").then((r) => setItems(r.data)).catch(() => setError("Could not load feedback"));

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/api/feedback", { name, message });
      setName(""); setMessage("");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not send feedback");
    }
  }

  return (
    <div className="page">
      <h1>Feedback</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="fb-name">Name</label>
        <input id="fb-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={50} />
        <label htmlFor="fb-msg">Message</label>
        <textarea id="fb-msg" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} />
        {error && <p className="error-msg">{error}</p>}
        <button type="submit">Send</button>
      </form>

      <h2>What people said</h2>
      {items.map((f) => (
        <div className="event-card" key={f._id}>
          <h3>{f.name}</h3>
          {UNSAFE_DEMO
            ? <p dangerouslySetInnerHTML={{ __html: f.message }} />
            : <p>{f.message}</p>}                                    // SAFE: always plain text
        </div>
      ))}
    </div>
  );
}

export default Feedback;
