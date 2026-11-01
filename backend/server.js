const mongoose = require("mongoose");
const app = require("./app");

const { MONGO_URI, JWT_SECRET, PORT = 5000 } = process.env;
if (!MONGO_URI || !JWT_SECRET) {
  console.error("MONGO_URI and JWT_SECRET must be set in the environment");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`API running on port ${PORT}`));
  })
  .catch((err) => { console.error("DB connection failed:", err.message); process.exit(1); });
