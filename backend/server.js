import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Use global fetch on Node 18+, fallback to node-fetch only if needed
let fetchFn = globalThis.fetch;
if (!fetchFn) {
  const { default: nf } = await import("node-fetch");
  fetchFn = nf;
}

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const ML_URL = "http://127.0.0.1:5001"; // force IPv4, not ::1


app.post("/api/forecast", async (req, res) => {
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
      console.error("ML service did not return JSON:", text);
      return res.status(502).json({ error: "ML service returned invalid response" });
    }

    // if ML returned an error JSON, propagate its status text/code if possible
    if (!response.ok) {
      return res.status(response.status).json(
        typeof data === "object" && data !== null ? data : { error: "ML service error" }
      );
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Error calling ML service:", err);
    res.status(500).json({ error: "ML service error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
