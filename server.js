import express from "express";
import yahooFinance from "yahoo-finance2";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors()); // Enable CORS

// Fetch complete stock data
app.get("/api/stock/:symbol", async (req, res) => {
  try {
    let { symbol } = req.params;
    const ticker = `${symbol}.NS`; // Ensure proper format for NSE stocks

    // Get the current date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Fetch all required data
    const [quote, quoteSummary, historical] = await Promise.all([
      yahooFinance.quote(ticker),
      yahooFinance.quoteSummary(ticker, {
        modules: ["summaryDetail", "defaultKeyStatistics", "financialData"],
      }),
      yahooFinance.historical(ticker, {
        period1: "2013-01-01", // Start from 10 years ago
        period2: today, // Ensure valid end date
        interval: "1y",
      }),
    ]);

    // Extract necessary data safely
    const trailingEps = quoteSummary.defaultKeyStatistics?.trailingEps || null;
    const bookValue = quoteSummary.summaryDetail?.bookValue || null;

    // Compute 10-year average PE and PB ratios
    let totalPE = 0,
      totalPB = 0,
      count = 0;

    historical.forEach((entry) => {
      if (entry.close) {
        if (trailingEps && trailingEps > 0) {
          totalPE += entry.close / trailingEps;
        }
        if (bookValue && bookValue > 0) {
          totalPB += entry.close / bookValue;
        }
        count++;
      }
    });

    const peTenYear = count > 0 ? (totalPE / count).toFixed(2) : "N/A";
    const pbTenYear = count > 0 ? (totalPB / count).toFixed(2) : "N/A";

    res.json({
      companyName: quote.longName || quote.shortName || symbol,
      symbol: ticker,
      marketPrice: quote.regularMarketPrice || "N/A",
      currency: quote.currency || "N/A",
      marketCap: quoteSummary.summaryDetail?.marketCap || "N/A",
      peRatio: quoteSummary.summaryDetail?.trailingPE || "N/A",
      pbRatio: quoteSummary.defaultKeyStatistics?.priceToBook || "N/A",
      dividendYield: quoteSummary.summaryDetail?.dividendYield || "N/A",
      totalRevenue: quoteSummary.financialData?.totalRevenue || "N/A",
      netIncome: quoteSummary.financialData?.netIncome || "N/A",
      profitMargins: quoteSummary.financialData?.profitMargins || "N/A",
      peTenYear,
      pbTenYear,
      historicalData: historical || [],
    });
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
