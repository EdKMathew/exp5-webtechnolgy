const router = require("express").Router();
const { body } = require("express-validator");
const { Registration } = require("../models");
const validate = require("./validate");

router.post("/",
  validate([
    body("name").isString().trim().isLength({ min: 1, max: 50 }).withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("phone").matches(/^[6-9]\d{9}$/).withMessage("Valid 10-digit Indian mobile number required"),
  ]),
  async (req, res, next) => {
    try {
      const { name, email, phone } = req.body;
      await Registration.create({ name, email, phone });
      res.status(201).json({ message: "Registered" });
    } catch (e) { next(e); }
  });

module.exports = router;
