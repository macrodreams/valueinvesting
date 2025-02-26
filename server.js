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
    symbol = symbol.toUpperCase() + ".NS"; // Append .NS for NSE stocks

    // Fetch stock data from Yahoo Finance
    const stockData = await yahooFinance.quoteSummary(symbol, {
      modules: ["summaryDetail", "defaultKeyStatistics", "financialData"],
    });

    const price = stockData.summaryDetail.previousClose || "N/A";
    const peRatio = stockData.defaultKeyStatistics.trailingPE || "N/A";
    const pbRatio = stockData.defaultKeyStatistics.priceToBook || "N/A";
    const freeCashFlow = stockData.financialData.freeCashflow || null;
    const earningsGrowth = stockData.financialData.earningsGrowth || 0;

    let intrinsicValue = "N/A";
    if (freeCashFlow && earningsGrowth > 0) {
      // Simple DCF Model: IV = (FCF * (1 + Growth Rate)) / Discount Rate
      const discountRate = 0.10; // 10% discount rate (adjustable)
      intrinsicValue = ((freeCashFlow * (1 + earningsGrowth)) / discountRate).toFixed(2);
    }

    res.json({
      symbol: symbol.replace(".NS", ""),
      price: `₹${price}`,
      pe: peRatio,
      pb: pbRatio,
      intrinsicValue: intrinsicValue !== "N/A" ? `₹${intrinsicValue}` : "N/A",
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
