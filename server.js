import express from "express";
import yahooFinance from "yahoo-finance2";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors()); // Enable CORS

app.get("/api/stock/:symbol", async (req, res) => {
  try {
    let { symbol } = req.params;
    const ticker = `${symbol}.NS`; // Append .NS for NSE stocks

    // Fetch stock data from Yahoo Finance
    const stockData = await yahooFinance.quoteSummary(ticker, {
      modules: ["summaryDetail", "defaultKeyStatistics"],
    });

    // Log API response for debugging
    console.log("Stock Data Response:", stockData);

    res.json({
      symbol: ticker,
      price: stockData.summaryDetail.previousClose || "N/A", // Current Price
      pe_ttm: stockData.defaultKeyStatistics.trailingPE || stockData.defaultKeyStatistics.forwardPE || "N/A", // PE Ratio (TTM) or Forward PE
      pb: stockData.defaultKeyStatistics.priceToBook || "N/A", // PB Ratio
      intrinsicValue: "N/A", // Placeholder for Intrinsic Value
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
