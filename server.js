import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors"; // ✅ Import CORS

dotenv.config(); // Load API keys from .env

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// ✅ Enable CORS for frontend (Netlify)
app.use(
  cors({
    origin: "https://stately-paletas-7ea4f8.netlify.app", // Replace with your actual frontend URL
    methods: "GET",
    allowedHeaders: "Content-Type",
  })
);

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY; // Store API key in .env

app.get("/api/stock/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;

    // Fetch stock data from Finnhub
    const response = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );

    const fundamentals = await axios.get(
      `https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${FINNHUB_API_KEY}`
    );

    res.json({
      symbol: symbol,
      price: response.data.c || "N/A", // Current Price
      pe: fundamentals.data.metric.peExclExtraTTM || "N/A", // PE Ratio
      pb: fundamentals.data.metric.pbExclExtraTTM || "N/A", // PB Ratio
      intrinsicValue: fundamentals.data.metric.fcfYieldTTM
        ? (1 / fundamentals.data.metric.fcfYieldTTM).toFixed(2) // Intrinsic Value
        : "N/A",
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
