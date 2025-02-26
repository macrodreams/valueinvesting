const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend access
app.use(cors());

// Route to fetch stock data (Replace API later)
app.get("/stock/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const API_KEY = process.env.NASDAQ_API_KEY; // Store API key in .env
    const apiUrl = `https://data.nasdaq.com/api/v3/datasets/NSE/${symbol}.json?api_key=${API_KEY}`;

    const response = await axios.get(apiUrl);
    const data = response.data.dataset;

    if (data) {
      res.json({
        symbol: data.dataset_code,
        price: data.data[0][1], // Adjust index for price
        pe: data.data[0][2], // Adjust index for PE
        pb: data.data[0][3], // Adjust index for PB
        intrinsicValue: 400, // Placeholder value
      });
    } else {
      res.status(404).json({ error: "Stock not found" });
    }
  } catch (error) {
    console.error("Error fetching stock data:", error.message);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
