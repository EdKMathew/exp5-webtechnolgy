import { useEffect, useState } from "react";
import api from "../api";

function Login() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get("/api/auth/me").then((r) => setUser(r.data.user)).catch(() => setUser(null));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    try {
      if (mode === "register") {
        await api.post("/api/auth/register", form);
        setMsg("Account created. Please log in.");
        setMode("login");
      } else {
        const r = await api.post("/api/auth/login", { email: form.email, password: form.password });
        setUser(r.data.user);
      }
    } catch (err) {
      setMsg(err.response?.data?.message || "Something went wrong");
    }
  }

  async function handleLogout() {
    await api.post("/api/auth/logout");
    setUser(null);
  }

  if (user) {
    return (
      <div className="page">
        <h1>Welcome, {user.name}</h1>
        <button onClick={handleLogout}>Log out</button>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>{mode === "login" ? "Login" : "Create account"}</h1>
      <form onSubmit={handleSubmit}>
        {mode === "register" && (
          <>
            <label htmlFor="l-name">Name</label>
            <input id="l-name" value={form.name} onChange={set("name")} />
          </>
        )}
        <label htmlFor="l-email">Email</label>
        <input id="l-email" value={form.email} onChange={set("email")} autoComplete="email" />
        <label htmlFor="l-pass">Password</label>
        <input id="l-pass" type="password" value={form.password} onChange={set("password")} autoComplete="current-password" />
        {msg && <p className="error-msg">{msg}</p>}
        <button type="submit">{mode === "login" ? "Login" : "Register"}</button>
      </form>
      <p>
        <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Need an account? Register" : "Have an account? Login"}
        </button>
      </p>
    </div>
  );
}

export default Login;
