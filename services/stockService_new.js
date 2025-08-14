import apiService from '../services/apiService';
import cacheService from '../services/cacheService';

const CACHE_KEYS = {
  TOP_GAINERS_LOSERS: 'top_gainers_losers',
  COMPANY_OVERVIEW: 'company_overview_',
  STOCK_CHART: 'stock_chart_',
};

const CACHE_DURATIONS = {
  STOCK_DATA: 5 * 60 * 1000, // 5 minutes
  COMPANY_DATA: 30 * 60 * 1000, // 30 minutes
  CHART_DATA: 10 * 60 * 1000, // 10 minutes
};

/**
 * Stock data operations
 */
class StockService {
  /**
   * Fetch top gainers and losers from Alpha Vantage API
   * @param {boolean} forceRefresh - Skip cache and force API call
   * @returns {Promise} - Formatted stock data
   */
  async fetchTopGainersLosers(forceRefresh = false) {
    try {
      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cachedData = await cacheService.get(CACHE_KEYS.TOP_GAINERS_LOSERS);
        if (cachedData) {
          console.log('Using cached stock data');
          return cachedData;
        }
      }

      console.log('Attempting to fetch from API...');
      const response = await apiService.getTopGainersLosers();
      
      if (!response.success) {
        console.log('API response unsuccessful, checking cache for fallback');
        const cachedData = await cacheService.get(CACHE_KEYS.TOP_GAINERS_LOSERS);
        if (cachedData) {
          console.log('Using expired cached data as fallback');
          return cachedData;
        }
        console.log('No cached data available, using fallback data');
        return this.getFallbackData();
      }

      const formattedData = this.formatStockData(response.data);
      
      // Cache the successful response
      await cacheService.set(
        CACHE_KEYS.TOP_GAINERS_LOSERS, 
        formattedData, 
        CACHE_DURATIONS.STOCK_DATA
      );
      
      console.log('Successfully fetched, formatted, and cached API data');
      return formattedData;
    } catch (error) {
      console.error('Error fetching top gainers/losers:', error);
      
      // Try to get cached data as fallback
      const cachedData = await cacheService.get(CACHE_KEYS.TOP_GAINERS_LOSERS);
      if (cachedData) {
        console.log('Using cached data as fallback due to API error');
        return cachedData;
      }
      
      console.log('Using fallback data due to API error and no cache available');
      return this.getFallbackData();
    }
  }

  /**
   * Fetch company overview data with caching
   * @param {string} symbol - Stock symbol
   * @param {boolean} forceRefresh - Skip cache and force API call
   * @returns {Promise} - Company data
   */
  async fetchCompanyOverview(symbol, forceRefresh = false) {
    try {
      const cacheKey = `${CACHE_KEYS.COMPANY_OVERVIEW}${symbol}`;
      
      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cachedData = await cacheService.get(cacheKey);
        if (cachedData) {
          console.log(`Using cached company data for ${symbol}`);
          return cachedData;
        }
      }

      console.log(`Fetching company overview for ${symbol} from API...`);
      const response = await apiService.getCompanyOverview(symbol);
      
      if (!response.success) {
        // Try to get cached data as fallback
        const cachedData = await cacheService.get(cacheKey);
        if (cachedData) {
          console.log(`Using cached data as fallback for ${symbol}`);
          return cachedData;
        }
        throw new Error(response.error || 'Failed to fetch company data');
      }

      // Cache the successful response
      await cacheService.set(cacheKey, response.data, CACHE_DURATIONS.COMPANY_DATA);
      
      console.log(`Successfully fetched and cached company data for ${symbol}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching company overview for ${symbol}:`, error);
      
      // Try to get cached data as final fallback
      const cacheKey = `${CACHE_KEYS.COMPANY_OVERVIEW}${symbol}`;
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        console.log(`Using cached data as final fallback for ${symbol}`);
        return cachedData;
      }
      
      throw error;
    }
  }

  /**
   * Fetch stock chart data with caching
   * @param {string} symbol - Stock symbol
   * @param {string} period - Time period for chart data
   * @param {boolean} forceRefresh - Skip cache and force API call
   * @returns {Promise} - Chart data
   */
  async fetchStockChart(symbol, period = '1M', forceRefresh = false) {
    try {
      const cacheKey = `${CACHE_KEYS.STOCK_CHART}${symbol}_${period}`;
      
      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cachedData = await cacheService.get(cacheKey);
        if (cachedData) {
          console.log(`Using cached chart data for ${symbol} (${period})`);
          return cachedData;
        }
      }

      console.log(`Fetching chart data for ${symbol} (${period}) from API...`);
      
      // Choose the appropriate API endpoint based on period
      let response;
      if (period === '1W' || period === '1M') {
        response = await apiService.getDailyTimeSeries(symbol, 'compact');
      } else if (period === '3M' || period === '6M' || period === '1Y') {
        response = await apiService.getWeeklyTimeSeries(symbol);
      } else {
        response = await apiService.getMonthlyTimeSeries(symbol);
      }
      
      if (!response.success) {
        // Try to get cached data as fallback
        const cachedData = await cacheService.get(cacheKey);
        if (cachedData) {
          console.log(`Using cached chart data as fallback for ${symbol} (${period})`);
          return cachedData;
        }
        throw new Error(response.error || 'Failed to fetch chart data');
      }

      const formattedData = this.formatChartData(response.data, period);
      
      // Cache the successful response
      await cacheService.set(cacheKey, formattedData, CACHE_DURATIONS.CHART_DATA);
      
      console.log(`Successfully fetched and cached chart data for ${symbol} (${period})`);
      return formattedData;
    } catch (error) {
      console.error(`Error fetching chart data for ${symbol} (${period}):`, error);
      
      // Try to get cached data as final fallback
      const cacheKey = `${CACHE_KEYS.STOCK_CHART}${symbol}_${period}`;
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        console.log(`Using cached chart data as final fallback for ${symbol} (${period})`);
        return cachedData;
      }
      
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
        name: this.getCompanyName(stock.ticker),
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
   * Format chart data for display
   * @param {Object} apiData - Raw API response
   * @param {string} period - Time period
   * @returns {Object} - Formatted chart data
   */
  formatChartData(apiData, period) {
    try {
      let timeSeries;
      let metaData;

      // Extract time series data based on API response structure
      if (apiData['Time Series (Daily)']) {
        timeSeries = apiData['Time Series (Daily)'];
        metaData = apiData['Meta Data'];
      } else if (apiData['Weekly Time Series']) {
        timeSeries = apiData['Weekly Time Series'];
        metaData = apiData['Meta Data'];
      } else if (apiData['Monthly Time Series']) {
        timeSeries = apiData['Monthly Time Series'];
        metaData = apiData['Meta Data'];
      } else {
        throw new Error('Invalid time series data format');
      }

      const dates = Object.keys(timeSeries).sort();
      const rawData = dates.map(date => ({
        date,
        price: parseFloat(timeSeries[date]['4. close']),
        volume: parseInt(timeSeries[date]['5. volume']),
        high: parseFloat(timeSeries[date]['2. high']),
        low: parseFloat(timeSeries[date]['3. low']),
        open: parseFloat(timeSeries[date]['1. open']),
      }));

      // Filter data based on period
      const filteredData = this.filterDataByPeriod(rawData, period);

      return {
        symbol: metaData ? metaData['2. Symbol'] : 'Unknown',
        lastRefreshed: metaData ? metaData['3. Last Refreshed'] : new Date().toISOString(),
        period,
        rawData: filteredData,
        dataPoints: filteredData.length,
      };
    } catch (error) {
      console.error('Error formatting chart data:', error);
      throw new Error('Failed to format chart data');
    }
  }

  /**
   * Filter chart data based on time period
   * @param {Array} data - Chart data array
   * @param {string} period - Time period
   * @returns {Array} - Filtered data
   */
  filterDataByPeriod(data, period) {
    const now = new Date();
    let cutoffDate;

    switch (period) {
      case '1W':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1M':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3M':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6M':
        cutoffDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1Y':
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case '5Y':
        cutoffDate = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return data; // Return all data if period is not recognized
    }

    return data.filter(item => new Date(item.date) >= cutoffDate);
  }

  /**
   * Get company name from ticker (placeholder - you might want to implement a ticker-to-name mapping)
   * @param {string} ticker - Stock ticker symbol
   * @returns {string} - Company name
   */
  getCompanyName(ticker) {
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
    };

    return knownTickers[ticker] || `${ticker} Inc.`;
  }

  /**
   * Get fallback data when API is unavailable
   * @returns {Object} - Fallback stock data
   */
  getFallbackData() {
    const dummyStocks = [
      {
        id: 1,
        ticker: 'AAPL',
        name: 'Apple Inc.',
        price: '$175.43',
        change: '+2.15%',
        changeAmount: '+$3.69',
        volume: '28,456,789'
      },
      {
        id: 2,
        ticker: 'GOOGL',
        name: 'Alphabet Inc.',
        price: '$142.87',
        change: '+1.87%',
        changeAmount: '+$2.63',
        volume: '31,287,456'
      },
      {
        id: 3,
        ticker: 'MSFT',
        name: 'Microsoft Corp.',
        price: '$367.12',
        change: '+0.92%',
        changeAmount: '+$3.34',
        volume: '22,876,543'
      },
      {
        id: 4,
        ticker: 'TSLA',
        name: 'Tesla Inc.',
        price: '$248.96',
        change: '-1.23%',
        changeAmount: '-$3.10',
        volume: '45,692,134'
      }
    ];

    return {
      metadata: {
        information: "Fallback data - API temporarily unavailable",
      },
      lastUpdated: new Date().toISOString(),
      topGainers: dummyStocks.slice(0, 3),
      topLosers: dummyStocks.slice(1, 4),
      mostActive: dummyStocks,
    };
  }

  /**
   * Clear all stock-related cache
   */
  async clearCache() {
    try {
      await cacheService.clearAll();
      console.log('All stock cache cleared');
    } catch (error) {
      console.error('Error clearing stock cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return await cacheService.getStats();
  }
}

export default new StockService();
