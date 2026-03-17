// server.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI || "mongodb://localhost:27017/payments")
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error(err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
