import express from "express";
import yahooFinance from "yahoo-finance2"; // Keep Yahoo Finance for future use
import cors from "cors";
import fs from "fs"; // File system module
import path from "path";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Load stock data from JSON file
const stocksFilePath = path.join(process.cwd(), "stocks.json");

const getStockData = () => {
  try {
    const data = fs.readFileSync(stocksFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading stocks.json:", error);
    return [];
  }
};

// Endpoint to get all stocks from JSON
app.get("/api/stocks", (req, res) => {
  const stockData = getStockData();
  res.json(stockData);
});

// Endpoint to get a specific stock by name
app.get("/api/stock/:name", (req, res) => {
  const { name } = req.params;
  const stockData = getStockData();
  const stock = stockData.find(
    (s) => s.stockName.toLowerCase() === name.toLowerCase()
  );

  if (!stock) {
    return res.status(404).json({ error: "Stock not found" });
  }

  res.json(stock);
});

// Placeholder for Yahoo API (Future Use)
app.get("/api/yahoo-stock/:symbol", async (req, res) => {
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

app.get("/api/yahoo-fundamentals/:symbol", async (req, res) => {
  try {
    let { symbol } = req.params;
    const ticker = `${symbol}.NS`; // NSE (India) stocks

    // Fetch detailed fundamental stock data from Yahoo Finance
    const stockData = await yahooFinance.quoteSummary(ticker, {
      modules: [
        "price",
        "summaryDetail",
        "defaultKeyStatistics",
        "financialData",
        "earnings",
        "balanceSheetHistory",
        "incomeStatementHistory",
        "cashflowStatementHistory"
      ],
    });

    // Structure the response to return only key fundamental data
    const response = {
      companyName: stockData.price?.longName || stockData.price?.shortName || symbol,
      symbol: ticker,
      marketPrice: stockData.price?.regularMarketPrice || "N/A",
      currency: stockData.price?.currency || "N/A",
      marketCap: stockData.summaryDetail?.marketCap || "N/A",
      peRatio: stockData.defaultKeyStatistics?.trailingPE || "N/A",
      pbRatio: stockData.defaultKeyStatistics?.priceToBook || "N/A",
      dividendYield: stockData.summaryDetail?.dividendYield || "N/A",
      totalRevenue: stockData.financialData?.totalRevenue || "N/A",
      netIncome: stockData.financialData?.netIncome || "N/A",
      profitMargins: stockData.financialData?.profitMargins || "N/A",
      operatingMargins: stockData.financialData?.operatingMargins || "N/A",
      earningsGrowth: stockData.financialData?.earningsGrowth || "N/A",
      revenueGrowth: stockData.financialData?.revenueGrowth || "N/A",
      debtToEquity: stockData.financialData?.debtToEquity || "N/A",
      returnOnEquity: stockData.financialData?.returnOnEquity || "N/A",
      balanceSheet: stockData.balanceSheetHistory?.balanceSheetStatements || [],
      incomeStatement: stockData.incomeStatementHistory?.incomeStatementHistory || [],
      cashFlowStatement: stockData.cashflowStatementHistory?.cashflowStatements || []
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
