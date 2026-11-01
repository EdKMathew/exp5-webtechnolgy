const router = require("express").Router();
const { body } = require("express-validator");
const { Feedback } = require("../models");
const validate = require("./validate");

router.get("/", async (req, res, next) => {
  try {
    res.json(await Feedback.find().sort({ createdAt: -1 }).limit(50).lean());
  } catch (e) { next(e); }
});

// Text is stored as typed; the React page shows it as plain text, so it can never run as HTML.
router.post("/",
  validate([
    body("name").isString().trim().isLength({ min: 1, max: 50 }).withMessage("Name is required (max 50)"),
    body("message").isString().trim().isLength({ min: 1, max: 500 }).withMessage("Message is required (max 500)"),
  ]),
  async (req, res, next) => {
    try {
      const fb = await Feedback.create({ name: req.body.name, message: req.body.message });
      res.status(201).json(fb);
    } catch (e) { next(e); }
  });

module.exports = router;
