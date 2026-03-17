import stripe from "../config/stripe.js";
import Payment from "../models/payment.js";

export const stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        // req.body is a raw Buffer here
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("⚠️ Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        console.log("💰 Payment succeeded:", paymentIntent.id);
        await Payment.findOneAndUpdate({ paymentIntentId: paymentIntent.id }, { status: "succeeded" });
    }

    if (event.type === "payment_intent.payment_failed") {
        const paymentIntent = event.data.object;
        console.log("❌ Payment failed:", paymentIntent.id);
        await Payment.findOneAndUpdate({ paymentIntentId: paymentIntent.id }, { status: "failed" });
    }

    res.json({ received: true });
};
