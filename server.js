import express from "express";
import yahooFinance from "yahoo-finance2";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors()); // Enable CORS

// Fetch stock details
app.get("/api/stock/:symbol", async (req, res) => {
  try {
    let { symbol } = req.params;
    const ticker = `${symbol}.NS`; // Append .NS for NSE stocks

    const stockData = await yahooFinance.quoteSummary(ticker, {
      modules: ["price", "summaryDetail", "defaultKeyStatistics"],
    });

    res.json({
      companyName: stockData.price?.longName || stockData.price?.shortName || symbol,
      symbol: ticker,
      price: stockData.summaryDetail?.previousClose || "N/A",
      pe_ttm: stockData.defaultKeyStatistics?.trailingPE || "N/A",
      pb: stockData.defaultKeyStatistics?.priceToBook || "N/A",
      intrinsicValue: "N/A", // Placeholder
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

    // ✅ Fix: Calculate a valid period1 timestamp (1 month ago)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const period1 = Math.floor(oneMonthAgo.getTime() / 1000); // Convert to Unix timestamp
    const period2 = Math.floor(Date.now() / 1000); // Current time

    // Fetch historical data
    const historicalData = await yahooFinance.chart(symbol, {
      period1: period1,
      period2: period2,
      interval: "1d", // Daily data
    });

    if (!historicalData || !historicalData.chart || !historicalData.chart.result) {
      throw new Error("No historical data available");
    }

    res.json(historicalData.chart.result[0]);
  } catch (error) {
    console.error("Error fetching historical stock data:", error);
    res.status(500).json({ error: "Failed to fetch historical stock data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
