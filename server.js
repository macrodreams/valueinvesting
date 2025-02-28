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
    const ticker = `${symbol}.NS`; // For NSE stocks

    // Compute valid historical date range (10 years ago to today)
    const today = new Date();
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(today.getFullYear() - 10);

    const period1 = Math.floor(tenYearsAgo.getTime() / 1000); // Convert to UNIX timestamp
    const period2 = Math.floor(today.getTime() / 1000); // Convert to UNIX timestamp

    // Fetch all required data
    const [quote, quoteSummary, historical] = await Promise.all([
      yahooFinance.quote(ticker),
      yahooFinance.quoteSummary(ticker, {
        modules: ["summaryDetail", "defaultKeyStatistics", "financialData"],
      }),
      yahooFinance.historical(ticker, { period1, period2, interval: "1y" }), // FIXED
    ]);

    // Debugging: Log full quote summary
    console.log("✅ Full Quote Summary:", JSON.stringify(quoteSummary, null, 2));

    // Extract values safely
    const eps = quoteSummary.defaultKeyStatistics?.trailingEps || null;
    const bookValue = quoteSummary.summaryDetail?.bookValue ||
                      quoteSummary.defaultKeyStatistics?.bookValue || null;

    // Compute 10-year average PE and PB ratios
    let totalPE = 0, totalPB = 0, count = 0;

    historical.forEach((entry) => {
      if (entry.close && eps) {
        totalPE += entry.close / eps;
      }
      if (entry.close && bookValue) {
        totalPB += entry.close / bookValue;
      }
      count++;
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
    console.error("❌ Error fetching stock data:", error);
    res.status(500).json({ error: `Failed to fetch stock data: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
