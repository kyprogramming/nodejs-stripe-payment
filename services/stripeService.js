import stripe from "../config/stripe.js";

export const createPaymentIntent = async (amount, currency = "usd", idempotencyKey) => {
    const options = idempotencyKey ? { idempotencyKey } : {};

    const paymentIntent = await stripe.paymentIntents.create(
        {
            amount,
            currency,
            payment_method_types: ["card"],
        },
        options // ✅ plain object, no spread needed
    );

    return paymentIntent;
};
