const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors()); // Enable CORS

const API_KEY = "hPGzbNz6pdJszyJ6dV8M"; // Replace with your actual API Key
const BASE_URL = "https://data.nasdaq.com/api/v3/datasets/NSE";

// API route to fetch stock data
app.get("/stock/:symbol", async (req, res) => {
  const { symbol } = req.params;

  try {
    const response = await axios.get(`${BASE_URL}/${symbol}.json?api_key=${API_KEY}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
