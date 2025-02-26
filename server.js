const express = require("express");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// Stock details route
app.get("/stock/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const API_KEY = process.env.NASDAQ_API_KEY; // Make sure you set this in Render
    const API_URL = `https://data.nasdaq.com/api/v3/datasets/NSE/${symbol}.json?api_key=${API_KEY}`;

    const response = await axios.get(API_URL);
    const stockData = response.data;

    res.json(stockData);
  } catch (error) {
    console.error("Error fetching stock data:", error.message);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

// Use Render's assigned PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
