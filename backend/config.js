module.exports = {
  // INSECURE_DEMO=true switches off the protections so you can show the attacks (steps 3-5)
  SECURE: process.env.INSECURE_DEMO !== "true",
  isProd: process.env.NODE_ENV === "production",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
};
