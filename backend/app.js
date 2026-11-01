require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { SECURE, CLIENT_URL } = require("./config");

const app = express();
app.set("trust proxy", 1); // Render sits behind a proxy; needed for secure cookies + rate limit

if (SECURE) app.use(helmet());                       // security headers (CSP, nosniff, HSTS...)
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "10kb" }));            // reject huge bodies
app.use(cookieParser());
if (SECURE) app.use(mongoSanitize());                // strips $ and . keys -> stops NoSQL injection

// Simple CSRF defence: browsers always send Origin on cross-site POSTs, so reject foreign ones.
app.use((req, res, next) => {
  const unsafe = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
  const origin = req.get("origin");
  if (SECURE && unsafe && origin && origin !== CLIENT_URL) {
    return res.status(403).json({ message: "Origin not allowed" });
  }
  next();
});

if (SECURE) {
  app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));
}

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/feedback", require("./routes/feedback"));
app.use("/api/registrations", require("./routes/registrations"));

app.use((req, res) => res.status(404).json({ message: "Not found" }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" }); // never leak stack traces
});

module.exports = app;
