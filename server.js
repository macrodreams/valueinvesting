const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

const API_KEY = "cuvl9bpr01qvpm3ragb0cuvl9bpr01qvpm3ragbg"; // Replace with actual key

app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

app.get("/api/stock/:symbol", async (req, res) => {
  const { symbol } = req.params;
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;

  try {
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching stock data:", error.message);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
