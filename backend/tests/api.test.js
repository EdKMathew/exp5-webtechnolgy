process.env.JWT_SECRET = "test-secret";
const request = require("supertest");
const app = require("../app");

describe("TechFest API security", () => {
  test("health check works", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("Helmet headers are set and X-Powered-By is hidden", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["content-security-policy"]).toBeDefined();
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  test("NoSQL injection login is rejected", async () => {
    const res = await request(app).post("/api/auth/login")
      .send({ email: { $ne: null }, password: { $ne: null } });
    expect(res.status).toBe(400);
  });

  test("registration rejects a weak password", async () => {
    const res = await request(app).post("/api/auth/register")
      .send({ name: "A", email: "a@b.com", password: "123" });
    expect(res.status).toBe(400);
  });

  test("event registration rejects a bad phone number", async () => {
    const res = await request(app).post("/api/registrations")
      .send({ name: "A", email: "a@b.com", phone: "12345" });
    expect(res.status).toBe(400);
  });

  test("foreign Origin is blocked (CSRF guard)", async () => {
    const res = await request(app).post("/api/feedback")
      .set("Origin", "https://evil.example").send({ name: "x", message: "y" });
    expect(res.status).toBe(403);
  });
});
