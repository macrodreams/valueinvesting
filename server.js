import express from "express";
import yahooFinance from "yahoo-finance2";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get("/api/stock/:symbol", async (req, res) => {
  try {
    let { symbol } = req.params;
    const ticker = `${symbol}.NS`; // For NSE stocks

    // Fetch all required data
    const [quote, quoteSummary] = await Promise.all([
      yahooFinance.quote(ticker),
      yahooFinance.quoteSummary(ticker, {
        modules: ["summaryDetail", "defaultKeyStatistics", "financialData"],
      }),
    ]);

    // Fix Historical Data Fetching
    const period1 = new Date("2013-01-01").getTime() / 1000; // Convert to UNIX timestamp

    const historical = await yahooFinance.historical(ticker, {
      period1,
      interval: "1mo", // Use 1-month interval
    });

    let totalPE = 0, totalPB = 0, count = 0;

    historical.forEach((entry) => {
      const eps = quoteSummary.defaultKeyStatistics?.trailingEps;
      const bookValue = quoteSummary.summaryDetail?.bookValue;

      if (entry.close && eps && eps > 0) {
        totalPE += entry.close / eps;
      }
      if (entry.close && bookValue && bookValue > 0) {
        totalPB += entry.close / bookValue;
      }
      count++;
    });

    const peTenYear = count > 0 ? (totalPE / count).toFixed(2) : "N/A";
    const pbTenYear = count > 0 ? (totalPB / count).toFixed(2) : "N/A";

    console.log("Computed 10-Year P/E:", peTenYear);
    console.log("Computed 10-Year P/B:", pbTenYear);

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
    });

  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
