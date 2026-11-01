const router = require("express").Router();
const { body } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { SECURE, isProd } = require("../config");
const validate = require("./validate");

// httpOnly: JS cannot read it (blocks XSS theft). secure: HTTPS only.
// sameSite: browser won't attach it to cross-site requests (CSRF). 'none' is needed in
// production only because Netlify and Render are on different domains.
const cookieOpts = SECURE
  ? { httpOnly: true, secure: isProd, sameSite: isProd ? "none" : "lax", maxAge: 60 * 60 * 1000 }
  : {};

const sign = (user) => jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: "1h" });

router.post("/register",
  validate([
    body("name").isString().trim().isLength({ min: 1, max: 50 }).withMessage("Name is required (max 50)"),
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").isString().isLength({ min: 8, max: 100 }).withMessage("Password must be 8+ characters"),
  ]),
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      if (await User.findOne({ email: String(email).toLowerCase() })) {
        return res.status(409).json({ message: "Email already registered" });
      }
      const stored = SECURE ? await bcrypt.hash(password, 10) : password; // demo mode stores plain text
      const user = await User.create({ name, email, password: stored });
      res.status(201).json({ message: "Registered", user: { name: user.name, email: user.email } });
    } catch (e) { next(e); }
  });

router.post("/login",
  validate([
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isString().notEmpty().withMessage("Password required"),
  ]),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      let user;
      if (SECURE) {
        user = await User.findOne({ email: String(email).toLowerCase() });
        if (user && !(await bcrypt.compare(String(password), user.password))) user = null;
      } else {
        // VULNERABLE (demo only): untrusted objects go straight into the query
        user = await User.findOne({ email, password });
      }
      if (!user) return res.status(401).json({ message: "Invalid email or password" });
      res.cookie("token", sign(user), cookieOpts);
      res.json({ message: "Logged in", user: { name: user.name, email: user.email } });
    } catch (e) { next(e); }
  });

router.get("/me", (req, res) => {
  try {
    const data = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    res.json({ user: { id: data.id, name: data.name } });
  } catch {
    res.status(401).json({ message: "Not logged in" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", cookieOpts);
  res.json({ message: "Logged out" });
});

module.exports = router;
