import "./firebase.js"; // Initialize Firebase
import { startMatchWorker } from "./workers/matchWorker.js";
import express from "express";
import cors from "cors";
import { verifyToken } from "./middleware/auth.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
})); // Enable CORS with restrictions
app.use(express.json()); // Parse JSON bodies

console.log("🚀 Server starting...");

// Start background workers
startMatchWorker();

// Public Routes
app.get("/", (req, res) => {
    res.send("I am alive! 🤖");
});

// Protected Routes (Example)
// Any route under /api will require a valid Firebase token
app.use("/api", verifyToken);

app.get("/api/status", (req, res) => {
    res.json({
        status: "secure",
        user: req.user.uid,
        message: "You are authenticated!"
    });
});

app.listen(PORT, () => {
    console.log(`🌍 Web server listening on port ${PORT}`);
});
