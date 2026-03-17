import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        userId: String,
        amount: Number,
        currency: String,
        paymentIntentId: String,
        status: {
            type: String,
            enum: ["pending", "succeeded", "failed"],
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Payment", paymentSchema);
