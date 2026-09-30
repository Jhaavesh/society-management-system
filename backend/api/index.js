import app from "../src/app.js";
import { connectDatabase } from "../src/config/db.js";

// Initialize database connection
connectDatabase().catch((error) => {
  console.error("Failed to connect to database in Vercel handler", error);
});

// Export the Express API
export default app;
