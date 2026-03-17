// app.js
import express from "express";
import paymentRoutes from "./routes/paymentRoutes.js";
import { stripeWebhook } from "./webhooks/stripeWebhook.js";

const app = express();
// Use JSON for API routes only
app.use("/api/payments", express.json(), paymentRoutes);


// Serve static files (frontend)
app.use(express.static("public"));

// Webhook route must be raw body
app.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

export default app;
