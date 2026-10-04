import "dotenv/config";
import { connectDatabase } from "./config/db.js";
import app from "./app.js";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing");
// SECURITY: Reject weak/placeholder secrets in production
const weakSecrets = ["your-super-secret", "change-this", "secret", "jwt-secret", "password"];
if (process.env.NODE_ENV !== "development" && (
  process.env.JWT_SECRET.length < 32 ||
  weakSecrets.some(w => process.env.JWT_SECRET.toLowerCase().includes(w))
)) {
  throw new Error("JWT_SECRET is too weak for production. Use a random string of at least 32 characters.");
}
const port = process.env.PORT || 5000;

connectDatabase().then(async () => {

  app.listen(port, () => console.log(`API listening on ${port}`));
}).catch((error) => {
  console.error("Database connection failed", error);
  process.exit(1);
});
