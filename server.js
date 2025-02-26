const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors()); // Allow frontend to access backend
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// Proxy API request to Nasdaq
app.get("/stock/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const API_KEY = process.env.NASDAQ_API_KEY;
    const API_URL = `https://data.nasdaq.com/api/v3/datasets/NSE/${symbol}.json?api_key=${API_KEY}`;

    const response = await axios.get(API_URL);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching stock data:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: "Failed to fetch stock data" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
