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
    
    // Append `.NS` for NSE stocks (assuming Indian stocks by default)
    const ticker = `${symbol}.NS`;

    // Fetch stock data from Yahoo Finance
    const stockData = await yahooFinance.quoteSummary(ticker, {
      modules: ["summaryDetail", "defaultKeyStatistics"],
    });

    res.json({
      symbol: ticker,
      price: stockData.summaryDetail.previousClose || "N/A", // Current Price
      pe: stockData.defaultKeyStatistics.trailingPE || "N/A", // PE Ratio
      pb: stockData.defaultKeyStatistics.priceToBook || "N/A", // PB Ratio
      intrinsicValue: "N/A", // Yahoo doesn't provide this directly
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
