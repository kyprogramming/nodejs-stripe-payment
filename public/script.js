import { STRIPE_PUBLIC_KEY } from "./constants.js";

const stripe = Stripe(STRIPE_PUBLIC_KEY);
const elements = stripe.elements();
const card = elements.create("card");
card.mount("#card-element");

const form = document.getElementById("payment-form");
const payBtn = document.getElementById("pay-btn");
const btnText = document.getElementById("btn-text");
const message = document.getElementById("message");

let isProcessing = false;
let idempotencyKey = generateIdempotencyKey(); // generated once per page load

function generateIdempotencyKey() {
    return `pay_${Date.now()}_${crypto.randomUUID()}`;
}

function setLoading(loading) {
    isProcessing = loading;
    payBtn.disabled = loading;
    payBtn.classList.toggle("loading", loading);
    btnText.textContent = loading ? "Processing…" : "Pay Now";
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isProcessing) return;

    setLoading(true);
    message.textContent = "";

    try {
        const response = await fetch("/api/payments/create-payment-intent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Idempotency-Key": idempotencyKey, // sent with every retry of the same payment
            },
            body: JSON.stringify({ amount: 1000 }),
        });

        if (!response.ok) {
            throw new Error("Failed to create payment intent. Please try again.");
        }

        const data = await response.json();

        const result = await stripe.confirmCardPayment(data.clientSecret, {
            payment_method: { card },
        });

        if (result.error) {
            message.textContent = result.error.message;
            setLoading(false);
            // ✅ Keep the same idempotencyKey so retrying the same payment
            // hits the same PaymentIntent instead of creating a new one
        } else if (result.paymentIntent.status === "succeeded") {
            btnText.textContent = "Payment successful!";
            idempotencyKey = generateIdempotencyKey(); // 🔄 rotate key after success
            window.location = "/success.html";
        }
    } catch (err) {
        message.textContent = err.message || "Something went wrong. Please try again.";
        setLoading(false);
        // ✅ Same key kept on network errors too — safe to retry
    }
});
