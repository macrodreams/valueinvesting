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
      modules: ["price", "summaryDetail", "defaultKeyStatistics"],
    });

    console.log("Stock Data Response:", stockData); // Debugging

    res.json({
      companyName:
        stockData.price?.longName ||
        stockData.price?.shortName ||
        symbol, // Default to symbol if name is missing
      symbol: ticker,
      price: stockData.summaryDetail?.previousClose || "N/A", // Current Price
      pe_ttm:
        stockData.defaultKeyStatistics?.trailingPE ||
        stockData.defaultKeyStatistics?.forwardPE ||
        "N/A", // PE Ratio (TTM) or Forward PE
      pb: stockData.defaultKeyStatistics?.priceToBook || "N/A", // PB Ratio
      intrinsicValue: "N/A", // Placeholder for Intrinsic Value
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

// Fetch historical stock price data
app.get("/api/stock/history/:symbol", async (req, res) => {
  try {
    let { symbol } = req.params;
    symbol = symbol.toUpperCase() + ".NS"; // Append .NS for NSE stocks

    // Get timestamps for the last 30 days
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1); // Go back one month

    const period1 = Math.floor(lastMonth.getTime() / 1000); // Convert to UNIX timestamp
    const period2 = Math.floor(today.getTime() / 1000); // Convert to UNIX timestamp

    // Fetch historical data
    const historicalData = await yahooFinance.chart(symbol, {
      period1, // Start date (UNIX timestamp)
      period2, // End date (UNIX timestamp)
      interval: "1d", // Daily data
    });

    res.json(historicalData);
  } catch (error) {
    console.error("Error fetching historical stock data:", error);
    res.status(500).json({ error: "Failed to fetch historical stock data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
