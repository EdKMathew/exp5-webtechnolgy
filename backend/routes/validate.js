const { validationResult } = require("express-validator");
const { SECURE } = require("../config");

// In INSECURE_DEMO mode validation is skipped so the "before" attack works.
module.exports = (rules) => SECURE
  ? [...rules, (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
      next();
    }]
  : [];
