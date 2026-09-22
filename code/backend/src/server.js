import "dotenv/config";
import { connectDatabase } from "./config/db.js";
import app from "./app.js";

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing");
const port = process.env.PORT || 5000;
connectDatabase().then(() => app.listen(port, () => console.log(`API listening on ${port}`))).catch((error) => {
  console.error("Database connection failed", error);
  process.exit(1);
});
