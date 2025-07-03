import apiService from '../services/apiService';

/**
 * Stock data operations
 */
class StockService {
  /**
   * Fetch top gainers and losers from Alpha Vantage API
   * @returns {Promise} - Formatted stock data
   */
  async fetchTopGainersLosers() {
    try {
      const response = await apiService.getTopGainersLosers();
      
      if (!response.success) {
        throw new Error(response.error);
      }

      return this.formatStockData(response.data);
    } catch (error) {
      console.error('Error fetching top gainers/losers:', error);
      throw error;
    }
  }

  /**
   * Format API response data to match our app structure
   * @param {Object} apiData - Raw API response
   * @returns {Object} - Formatted data
   */
  formatStockData(apiData) {
    const formatStockList = (stocks) => {
      return stocks.map((stock, index) => ({
        id: index + 1,
        ticker: stock.ticker,
        name: this.getCompanyName(stock.ticker), // Placeholder - you might want to get real company names
        price: `$${parseFloat(stock.price).toFixed(2)}`,
        change: stock.change_percentage,
        changeAmount: `$${parseFloat(stock.change_amount).toFixed(2)}`,
        volume: stock.volume,
      }));
    };

    return {
      metadata: apiData.metadata,
      lastUpdated: apiData.last_updated,
      topGainers: formatStockList(apiData.top_gainers || []),
      topLosers: formatStockList(apiData.top_losers || []),
      mostActive: formatStockList(apiData.most_actively_traded || []),
    };
  }

  /**
   * Get company name from ticker (placeholder - you might want to implement a ticker-to-name mapping)
   * @param {string} ticker - Stock ticker symbol
   * @returns {string} - Company name
   */
  getCompanyName(ticker) {
    // This is a placeholder. In a real app, you might have a mapping or another API call
    const knownTickers = {
      'AAPL': 'Apple Inc.',
      'TSLA': 'Tesla Inc.',
      'MSFT': 'Microsoft Corp.',
      'AMZN': 'Amazon.com Inc.',
      'GOOGL': 'Alphabet Inc.',
      'META': 'Meta Platforms Inc.',
      'NFLX': 'Netflix Inc.',
      'NVDA': 'NVIDIA Corp.',
      'BRK.A': 'Berkshire Hathaway',
      'BRK.B': 'Berkshire Hathaway',
      'UNH': 'UnitedHealth Group',
      'JNJ': 'Johnson & Johnson',
      'JPM': 'JPMorgan Chase',
      'V': 'Visa Inc.',
      'PG': 'Procter & Gamble',
      'HD': 'Home Depot',
      'MA': 'Mastercard Inc.',
      'BAC': 'Bank of America',
      'ABBV': 'AbbVie Inc.',
      'PFE': 'Pfizer Inc.',
      'KO': 'Coca-Cola',
      'AVGO': 'Broadcom Inc.',
      'PEP': 'PepsiCo Inc.',
      'TMO': 'Thermo Fisher',
      'COST': 'Costco Wholesale',
      'DIS': 'Walt Disney',
      'ABT': 'Abbott Laboratories',
      'ACN': 'Accenture',
      'VZ': 'Verizon',
      'ADBE': 'Adobe Inc.',
      'DHR': 'Danaher Corp.',
      'WMT': 'Walmart Inc.',
      'TXN': 'Texas Instruments',
      'NEE': 'NextEra Energy',
      'BMY': 'Bristol Myers',
      'T': 'AT&T Inc.',
      'PM': 'Philip Morris',
      'RTX': 'Raytheon Tech.',
      'LOW': 'Lowe\'s Companies',
      'ORCL': 'Oracle Corp.',
      'QCOM': 'Qualcomm Inc.',
    };

    return knownTickers[ticker] || `${ticker} Corp.`;
  }

  /**
   * Fetch company overview data
   * @param {string} symbol - Stock symbol
   * @returns {Promise} - Formatted company overview data
   */
  async fetchCompanyOverview(symbol) {
    try {
      const response = await apiService.getCompanyOverview(symbol);
      
      if (!response.success) {
        throw new Error(response.error);
      }

      return this.formatCompanyOverview(response.data);
    } catch (error) {
      console.error('Error fetching company overview:', error);
      throw error;
    }
  }

  /**
   * Format company overview data
   * @param {Object} apiData - Raw API response
   * @returns {Object} - Formatted company data
   */
  formatCompanyOverview(apiData) {
    return {
      symbol: apiData.Symbol,
      name: apiData.Name,
      description: apiData.Description,
      exchange: apiData.Exchange,
      currency: apiData.Currency,
      country: apiData.Country,
      sector: apiData.Sector,
      industry: apiData.Industry,
      marketCap: apiData.MarketCapitalization,
      peRatio: apiData.PERatio,
      pegRatio: apiData.PEGRatio,
      bookValue: apiData.BookValue,
      dividendYield: apiData.DividendYield,
      eps: apiData.EPS,
      revenuePerShare: apiData.RevenuePerShareTTM,
      profitMargin: apiData.ProfitMargin,
      operatingMargin: apiData.OperatingMarginTTM,
      returnOnAssets: apiData.ReturnOnAssetsTTM,
      returnOnEquity: apiData.ReturnOnEquityTTM,
      week52High: apiData['52WeekHigh'],
      week52Low: apiData['52WeekLow'],
      movingAverage50: apiData['50DayMovingAverage'],
      movingAverage200: apiData['200DayMovingAverage'],
      sharesOutstanding: apiData.SharesOutstanding,
      beta: apiData.Beta,
      address: apiData.Address,
    };
  }

  /**
   * Fetch historical stock data for charts
   * @param {string} symbol - Stock symbol
   * @param {string} period - Time period (1W, 1M, 3M, 6M, 1Y, 5Y)
   * @returns {Promise} - Formatted chart data
   */
  async fetchChartData(symbol, period = '1M') {
    try {
      let response;
      
      // Choose appropriate API endpoint based on period
      switch(period) {
        case '1W':
          response = await apiService.getIntradayTimeSeries(symbol, '60min');
          break;
        case '1M':
        case '3M':
        case '6M':
          response = await apiService.getDailyTimeSeries(symbol, 'compact');
          break;
        case '1Y':
        case '5Y':
          response = await apiService.getDailyTimeSeries(symbol, 'full');
          break;
        default:
          response = await apiService.getDailyTimeSeries(symbol, 'compact');
      }

      if (!response.success) {
        throw new Error(response.error);
      }

      return this.formatChartData(response.data, period);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  }

  /**
   * Format chart data for React Native Chart Kit
   * @param {Object} apiData - Raw API response
   * @param {string} period - Time period
   * @returns {Object} - Formatted chart data
   */
  formatChartData(apiData, period) {
    let timeSeriesKey = '';
    let dataPoints = [];

    // Find the correct time series key
    if (apiData['Time Series (Daily)']) {
      timeSeriesKey = 'Time Series (Daily)';
    } else if (apiData['Time Series (60min)']) {
      timeSeriesKey = 'Time Series (60min)';
    } else if (apiData['Weekly Time Series']) {
      timeSeriesKey = 'Weekly Time Series';
    } else if (apiData['Monthly Time Series']) {
      timeSeriesKey = 'Monthly Time Series';
    }

    if (!timeSeriesKey || !apiData[timeSeriesKey]) {
      throw new Error('No time series data found');
    }

    const timeSeries = apiData[timeSeriesKey];
    const dates = Object.keys(timeSeries).sort();

    // Filter dates based on period
    const filteredDates = this.filterDatesByPeriod(dates, period);

    // Extract price data
    filteredDates.forEach(date => {
      const dayData = timeSeries[date];
      dataPoints.push({
        date: date,
        price: parseFloat(dayData['4. close']),
        high: parseFloat(dayData['2. high']),
        low: parseFloat(dayData['3. low']),
        open: parseFloat(dayData['1. open']),
        volume: parseInt(dayData['5. volume']),
      });
    });

    // Sort by date (ascending)
    dataPoints.sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      labels: dataPoints.map(point => this.formatDateLabel(point.date, period)),
      datasets: [{
        data: dataPoints.map(point => point.price),
        color: (opacity = 1) => `rgba(0, 208, 156, ${opacity})`,
        strokeWidth: 2,
      }],
      rawData: dataPoints,
    };
  }

  /**
   * Filter dates based on time period
   * @param {Array} dates - Array of date strings
   * @param {string} period - Time period
   * @returns {Array} - Filtered dates
   */
  filterDatesByPeriod(dates, period) {
    const now = new Date();
    const sortedDates = dates.sort((a, b) => new Date(b) - new Date(a)); // Most recent first

    switch(period) {
      case '1W':
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return sortedDates.filter(date => new Date(date) >= oneWeekAgo).slice(0, 30);
      case '1M':
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return sortedDates.filter(date => new Date(date) >= oneMonthAgo).slice(0, 30);
      case '3M':
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return sortedDates.filter(date => new Date(date) >= threeMonthsAgo).slice(0, 60);
      case '6M':
        const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        return sortedDates.filter(date => new Date(date) >= sixMonthsAgo).slice(0, 120);
      case '1Y':
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return sortedDates.filter(date => new Date(date) >= oneYearAgo).slice(0, 250);
      case '5Y':
        return sortedDates.slice(0, 1000); // Last 1000 data points for 5 years
      default:
        return sortedDates.slice(0, 30);
    }
  }

  /**
   * Format date labels for chart display
   * @param {string} date - Date string
   * @param {string} period - Time period
   * @returns {string} - Formatted date label
   */
  formatDateLabel(date, period) {
    const dateObj = new Date(date);
    
    switch(period) {
      case '1W':
        return dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      case '1M':
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '3M':
      case '6M':
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '1Y':
        return dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      case '5Y':
        return dateObj.toLocaleDateString('en-US', { year: 'numeric' });
      default:
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }
}

export default new StockService();
