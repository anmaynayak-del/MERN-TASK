const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  // ignore if not supported
}
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config(); // fallback to root .env if present

const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mern_signup";

// Middleware
app.use(cors());
app.use(express.json());

// In-memory fallback if MongoDB local daemon isn't running
let inMemoryUsers = [];

// Mask sensitive credentials in MongoDB URI for logging
function sanitizeUri(uri) {
  if (!uri) return "";
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/, "$1****$3");
}

// Connect to MongoDB
async function connectDB() {
  const sanitized = sanitizeUri(MONGO_URI);
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log("Connected to MongoDB successfully at:", sanitized);
  } catch (err) {
    console.warn(
      `MongoDB connection to "${sanitized}" not active (${err.message}). Using fallback persistence until MongoDB service starts.`
    );
  }
}

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB database.");
});
mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err.message);
});
mongoose.connection.on("disconnected", () => {
  console.warn("Mongoose disconnected.");
});

connectDB();

// ==================== REST API ====================

// Health Check
app.get("/api/health", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: "ok",
    database: isConnected ? "connected" : "in-memory-fallback",
  });
});

// Sign Up Route (POST /api/signup)
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate inputs
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Both Email and Password are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if user already exists
    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res
          .status(409)
          .json({ message: "An account with this email already exists." });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Save to MongoDB
      const newUser = new User({
        email: normalizedEmail,
        password: hashedPassword,
      });
      await newUser.save();

      return res.status(201).json({
        success: true,
        message: "Sign Up successful! Saved in MongoDB.",
        user: {
          id: newUser._id,
          email: newUser.email,
        },
      });
    } else {
      // Fallback
      const existing = inMemoryUsers.find((u) => u.email === normalizedEmail);
      if (existing) {
        return res
          .status(409)
          .json({ message: "An account with this email already exists." });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = {
        id: (inMemoryUsers.length + 1).toString(),
        email: normalizedEmail,
        password: hashedPassword,
        createdAt: new Date(),
      };
      inMemoryUsers.push(newUser);

      return res.status(201).json({
        success: true,
        message: "Sign Up successful! (User registered)",
        user: {
          id: newUser.id,
          email: newUser.email,
        },
      });
    }
  } catch (error) {
    console.error("Sign up error:", error);
    return res
      .status(500)
      .json({ message: "Server error occurred. Please try again." });
  }
});

// View users
app.get("/api/users", async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
      return res.json(users);
    } else {
      return res.json(
        inMemoryUsers.map(({ id, email, createdAt }) => ({
          id,
          email,
          createdAt,
        }))
      );
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Explicit 404 for Login Route
app.all("/api/login", (req, res) => {
  res.status(404).json({
    status: 404,
    error: "Not Found",
    message: "The login route is currently unavailable. Please use the registration pipeline at /api/signup.",
  });
});

// Serve Frontend built files if present
const frontendDist = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Task 2 Server running at http://localhost:${PORT}`);
});
