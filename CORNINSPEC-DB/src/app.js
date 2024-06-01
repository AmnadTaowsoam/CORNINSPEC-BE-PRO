// Import necessary modules
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");  // Note: bodyParser is deprecated in the newer versions of Express
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const cors = require("cors"); // Import the cors module
require("dotenv").config({ path: '../.env' });
const cookieParser = require("cookie-parser");

// Importing custom middleware and models
const authenticateToken = require("./middleware/authenticateToken");
const { getUserByUsername } = require("./models/userModel");
const refreshTokenModel = require("./models/refreshTokenModel");

// Import routes
const userRoutes = require("./routes/userRoutes"); // Assume you have this
const authRoutes = require("./routes/authRoutes"); // Assume you have this

// Initialize express app
const app = express();

// Applying essential middleware
console.log("Registering middleware...");
app.use(helmet());
console.log("Middleware registered.");

const corsOptionsDelegate = (req, callback) => {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",");

  const origin = req.header("Origin");
  if (!origin) {
    // Allow requests with no origin (like mobile apps or curl requests)
    callback(null, { origin: true, credentials: true });
  } else if (allowedOrigins.indexOf(origin) !== -1) {
    // Reflect the origin if it's in the allowed list
    callback(null, { origin: true, credentials: true });
  } else {
    // Block CORS requests not coming from allowed origin
    callback(new Error("CORS not allowed"), { origin: false });
  }
};

app.use(cors(corsOptionsDelegate));

// Body parsing Middleware (using built-in middleware as bodyParser is deprecated)
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Logging Middleware
app.use(morgan("dev")); // For logging request details

// Before your route declarations
app.use(cookieParser());

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Use routes
app.use("/api/users", userRoutes);
console.log("Registering routes...");
app.use("/api/auth", authRoutes);
console.log("Routes registered.");

// Basic route for the root of the site
app.get("/", (req, res) => {
  console.log("Root route hit.");
  res.send("Service is running");
});

// Error handling for 404 Not Found
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  res.status(404).json({ message: "Not Found" });
  next();
});

app.use((error, req, res, next) => {
  console.error(error); // Log the error
  res.status(500).json({ message: "Internal Server Error" });
});

// Set the port from .env or default to 3000
const PORT = process.env.PORT || 3000;

// Start the server
app
  .listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })
  .on("error", (err) => {
    console.error("Failed to start server:", err);
  });
