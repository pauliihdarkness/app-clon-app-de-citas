import "./firebase.js"; // Initialize Firebase
import { startMatchWorker } from "./workers/matchWorker.js";
import express from "express";
import cors from "cors";
import helmet from "helmet"; // Import helmet
import { verifyToken } from "./middleware/auth.js";
import { verifyTurnstileEndpoint } from "./middleware/turnstile.js"; // Import Turnstile
import { createServer } from "http"; // Import http
import { setupSocket } from "./socket/socketHandler.js"; // Import socket handler
import matchesRouter from "./routes/matches.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware (Helmet)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://challenges.cloudflare.com", "https://apis.google.com", "https://www.gstatic.com"],
            frameSrc: ["'self'", "https://challenges.cloudflare.com", "https://*.firebaseapp.com"],
            connectSrc: [
                "'self'",
                "https://identitytoolkit.googleapis.com",
                "https://securetoken.googleapis.com",
                "https://challenges.cloudflare.com",
                "https://api.cloudinary.com",
                "https://www.googleapis.com",
                "wss://*.firebaseio.com"
            ],
            imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://lh3.googleusercontent.com"],
            styleSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline needed for some styled-components/emotion
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        },
    },
}));

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

// Create HTTP server
const httpServer = createServer(app);

// Setup Socket.io
setupSocket(httpServer, allowedOrigins);

console.log("🚀 Server starting...");

// Start background workers
startMatchWorker();

// Public Routes
app.get("/", (req, res) => {
    res.send("I am alive! 🤖");
});

// Turnstile Verification Endpoint
app.post("/api/verify-turnstile", verifyTurnstileEndpoint);

// Public API Routes
app.use("/api/matches", matchesRouter);



// ... (previous imports)

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

// Listen on httpServer instead of app
httpServer.listen(PORT, () => {
    console.log(`🌍 Web server listening on port ${PORT}`);
});
