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

    // Fetch historical data
    const historicalData = await yahooFinance.chart(symbol, {
      period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      period2: new Date().toISOString(), // Current date
      interval: "1d", // Daily data
    });

    if (!historicalData || !historicalData.result || historicalData.result.length === 0) {
      throw new Error("No historical data available");
    }

    res.json(historicalData.result[0]); // Send the first result
  } catch (error) {
    console.error("Error fetching historical stock data:", error.message);
    res.status(500).json({ error: "Failed to fetch historical stock data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
