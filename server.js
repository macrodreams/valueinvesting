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
      intrinsicValue: "N/A",
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
