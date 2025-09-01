import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

let fetchFn = globalThis.fetch;
if (!fetchFn) {
  const { default: nf } = await import("node-fetch");
  fetchFn = nf;
}

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const ML_URL = process.env.ML_URL || "http://127.0.0.1:5001";
const JWT_SECRET = process.env.JWT_SECRET || "mysecret"; // put in .env
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/stockdb";

// 1. Connect MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("✅ MongoDB connected"));

// 2. Define User model
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String, // hashed
});
const User = mongoose.model("User", userSchema);

// 3. Signup route
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "Username and password required" });

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed });
    await user.save();

    res.json({ message: "User created successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 4. Login route
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, username }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 5. Middleware to protect routes
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Missing token" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
}

// 6. Forecast route (protected)
app.post("/api/forecast", authMiddleware, async (req, res) => {
  try {
    const response = await fetchFn(`${ML_URL}/forecast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("ML service returned invalid JSON:", text);
      return res
        .status(502)
        .json({ error: "ML service returned invalid response" });
    }

    if (!response.ok) {
      return res
        .status(response.status)
        .json(typeof data === "object" ? data : { error: "ML service error" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Error calling ML service:", err);
    res.status(500).json({ error: "ML service error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
