// controllers/paymentController.js
import { createPaymentIntent } from "../services/stripeService.js";
import Payment from "../models/payment.js";

const intentCache = new Map(); // use Redis in production

export const createPayment = async (req, res) => {
    const { amount } = req.body;
    const idempotencyKey = req.headers["idempotency-key"];

    // --- validation ---
    if (!amount || typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ error: "A valid amount is required." });
    }

    if (!idempotencyKey) {
        return res.status(400).json({ error: "Idempotency-Key header is required." });
    }

    // --- deduplicate ---
    if (intentCache.has(idempotencyKey)) {
        console.log(`[idempotent] returning cached intent for key: ${idempotencyKey}`);
        return res.json(intentCache.get(idempotencyKey));
    }

    // --- create ---
    try {
        const paymentIntent = await createPaymentIntent(amount, "usd", idempotencyKey);

        const payload = { clientSecret: paymentIntent.client_secret };
        intentCache.set(idempotencyKey, payload); // cache after success only

        // Save to MongoDB
        await Payment.create({
            paymentIntentId: paymentIntent.id,
            amount,
            status: "pending",
        });
        
        return res.status(201).json(payload);
    } catch (err) {
        console.error("[stripe] createPaymentIntent failed:", err.message);
        return res.status(500).json({ error: "Payment initialization failed. Please try again." });
        // ✅ key is NOT cached on failure — client can safely retry with the same key
    }
};
