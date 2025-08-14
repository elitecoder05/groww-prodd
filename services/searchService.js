import apiService from './apiService';
import cacheService from './cacheService';

const CACHE_KEYS = {
  SEARCH_RESULTS: 'search_results_',
};

const CACHE_DURATIONS = {
  SEARCH_RESULTS: 15 * 60 * 1000, // 15 minutes
};

class SearchService {
  /**
   * Search for stocks/ETFs using symbol or company name
   * @param {string} query - Search query (symbol or company name)
   * @param {boolean} forceRefresh - Skip cache and force API call
   * @returns {Promise} - Search results
   */
  async searchStocks(query, forceRefresh = false) {
    if (!query || query.trim().length < 1) {
      return [];
    }

    const cleanQuery = query.trim().toUpperCase();
    const cacheKey = `${CACHE_KEYS.SEARCH_RESULTS}${cleanQuery}`;

    try {
      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cachedData = await cacheService.get(cacheKey);
        if (cachedData) {
          console.log(`Using cached search results for: ${cleanQuery}`);
          return cachedData;
        }
      }

      console.log(`Searching for stocks with query: ${cleanQuery}`);
      
      // For now, we'll implement a simple local search against known tickers
      // In a real app, you might use Alpha Vantage's SYMBOL_SEARCH endpoint
      const results = this.performLocalSearch(cleanQuery);
      
      // Cache the results
      await cacheService.set(cacheKey, results, CACHE_DURATIONS.SEARCH_RESULTS);
      
      console.log(`Found ${results.length} results for: ${cleanQuery}`);
      return results;
    } catch (error) {
      console.error('Error searching stocks:', error);
      return [];
    }
  }

  /**
   * Perform local search against known stock symbols and names
   * @param {string} query - Search query
   * @returns {Array} - Search results
   */
  performLocalSearch(query) {
    const stockDatabase = this.getStockDatabase();
    const results = [];

    // Search by symbol (exact match gets priority)
    const exactSymbolMatch = stockDatabase.find(stock => 
      stock.symbol === query
    );
    if (exactSymbolMatch) {
      results.push({ ...exactSymbolMatch, matchType: 'exact_symbol' });
    }

    // Search by symbol (partial match)
    const symbolMatches = stockDatabase.filter(stock => 
      stock.symbol.includes(query) && stock.symbol !== query
    );
    results.push(...symbolMatches.map(stock => ({ ...stock, matchType: 'partial_symbol' })));

    // Search by company name (partial match)
    const nameMatches = stockDatabase.filter(stock => 
      stock.name.toUpperCase().includes(query) && 
      !results.some(r => r.symbol === stock.symbol)
    );
    results.push(...nameMatches.map(stock => ({ ...stock, matchType: 'name' })));

    // Limit results and sort by relevance
    return results
      .slice(0, 20) // Limit to 20 results
      .sort((a, b) => {
        // Sort by match type priority: exact_symbol > partial_symbol > name
        const priority = { exact_symbol: 0, partial_symbol: 1, name: 2 };
        return priority[a.matchType] - priority[b.matchType];
      });
  }

  /**
   * Get expanded stock database for search
   * @returns {Array} - Array of stock objects
   */
  getStockDatabase() {
    return [
      { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', exchange: 'NASDAQ' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', exchange: 'NASDAQ' },
      { symbol: 'GOOG', name: 'Alphabet Inc. Class A', sector: 'Technology', exchange: 'NASDAQ' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', exchange: 'NASDAQ' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary', exchange: 'NASDAQ' },
      { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Discretionary', exchange: 'NASDAQ' },
      { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', exchange: 'NASDAQ' },
      { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Communication Services', exchange: 'NASDAQ' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', exchange: 'NASDAQ' },
      { symbol: 'CRM', name: 'Salesforce Inc.', sector: 'Technology', exchange: 'NYSE' },
      { symbol: 'ORCL', name: 'Oracle Corporation', sector: 'Technology', exchange: 'NYSE' },
      { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology', exchange: 'NASDAQ' },
      { symbol: 'PYPL', name: 'PayPal Holdings Inc.', sector: 'Financial Services', exchange: 'NASDAQ' },
      { symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology', exchange: 'NASDAQ' },
      { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', sector: 'Technology', exchange: 'NASDAQ' },
      { symbol: 'QCOM', name: 'Qualcomm Incorporated', sector: 'Technology', exchange: 'NASDAQ' },
      { symbol: 'AVGO', name: 'Broadcom Inc.', sector: 'Technology', exchange: 'NASDAQ' },
      { symbol: 'TXN', name: 'Texas Instruments Incorporated', sector: 'Technology', exchange: 'NASDAQ' },
      { symbol: 'CSCO', name: 'Cisco Systems Inc.', sector: 'Technology', exchange: 'NASDAQ' },
      { symbol: 'ACN', name: 'Accenture plc', sector: 'Technology', exchange: 'NYSE' },
      { symbol: 'IBM', name: 'International Business Machines Corporation', sector: 'Technology', exchange: 'NYSE' },
      { symbol: 'UBER', name: 'Uber Technologies Inc.', sector: 'Technology', exchange: 'NYSE' },
      { symbol: 'LYFT', name: 'Lyft Inc.', sector: 'Technology', exchange: 'NASDAQ' },
      { symbol: 'SQ', name: 'Block Inc.', sector: 'Technology', exchange: 'NYSE' },
      { symbol: 'SHOP', name: 'Shopify Inc.', sector: 'Technology', exchange: 'NYSE' },
      { symbol: 'SPOT', name: 'Spotify Technology S.A.', sector: 'Communication Services', exchange: 'NYSE' },
      { symbol: 'TWTR', name: 'Twitter Inc.', sector: 'Communication Services', exchange: 'NYSE' },
      { symbol: 'SNAP', name: 'Snap Inc.', sector: 'Communication Services', exchange: 'NYSE' },
      { symbol: 'PINS', name: 'Pinterest Inc.', sector: 'Communication Services', exchange: 'NYSE' },
      
      // Financial Sector
      { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services', exchange: 'NYSE' },
      { symbol: 'BAC', name: 'Bank of America Corporation', sector: 'Financial Services', exchange: 'NYSE' },
      { symbol: 'WFC', name: 'Wells Fargo & Company', sector: 'Financial Services', exchange: 'NYSE' },
      { symbol: 'C', name: 'Citigroup Inc.', sector: 'Financial Services', exchange: 'NYSE' },
      { symbol: 'GS', name: 'The Goldman Sachs Group Inc.', sector: 'Financial Services', exchange: 'NYSE' },
      { symbol: 'MS', name: 'Morgan Stanley', sector: 'Financial Services', exchange: 'NYSE' },
      { symbol: 'V', name: 'Visa Inc.', sector: 'Financial Services', exchange: 'NYSE' },
      { symbol: 'MA', name: 'Mastercard Incorporated', sector: 'Financial Services', exchange: 'NYSE' },
      { symbol: 'AXP', name: 'American Express Company', sector: 'Financial Services', exchange: 'NYSE' },
      
      // Healthcare
      { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', exchange: 'NYSE' },
      { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', exchange: 'NYSE' },
      { symbol: 'UNH', name: 'UnitedHealth Group Incorporated', sector: 'Healthcare', exchange: 'NYSE' },
      { symbol: 'ABBV', name: 'AbbVie Inc.', sector: 'Healthcare', exchange: 'NYSE' },
      { symbol: 'LLY', name: 'Eli Lilly and Company', sector: 'Healthcare', exchange: 'NYSE' },
      { symbol: 'MRK', name: 'Merck & Co. Inc.', sector: 'Healthcare', exchange: 'NYSE' },
      { symbol: 'TMO', name: 'Thermo Fisher Scientific Inc.', sector: 'Healthcare', exchange: 'NYSE' },
      { symbol: 'ABT', name: 'Abbott Laboratories', sector: 'Healthcare', exchange: 'NYSE' },
      { symbol: 'DHR', name: 'Danaher Corporation', sector: 'Healthcare', exchange: 'NYSE' },
      
      // Consumer Goods
      { symbol: 'PG', name: 'The Procter & Gamble Company', sector: 'Consumer Staples', exchange: 'NYSE' },
      { symbol: 'KO', name: 'The Coca-Cola Company', sector: 'Consumer Staples', exchange: 'NYSE' },
      { symbol: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer Staples', exchange: 'NASDAQ' },
      { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Staples', exchange: 'NYSE' },
      { symbol: 'COST', name: 'Costco Wholesale Corporation', sector: 'Consumer Staples', exchange: 'NASDAQ' },
      { symbol: 'HD', name: 'The Home Depot Inc.', sector: 'Consumer Discretionary', exchange: 'NYSE' },
      { symbol: 'LOW', name: 'Lowe\'s Companies Inc.', sector: 'Consumer Discretionary', exchange: 'NYSE' },
      { symbol: 'MCD', name: 'McDonald\'s Corporation', sector: 'Consumer Discretionary', exchange: 'NYSE' },
      { symbol: 'SBUX', name: 'Starbucks Corporation', sector: 'Consumer Discretionary', exchange: 'NASDAQ' },
      { symbol: 'NKE', name: 'NIKE Inc.', sector: 'Consumer Discretionary', exchange: 'NYSE' },
      
      // Energy
      { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy', exchange: 'NYSE' },
      { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy', exchange: 'NYSE' },
      { symbol: 'COP', name: 'ConocoPhillips', sector: 'Energy', exchange: 'NYSE' },
      
      // Industrial
      { symbol: 'BA', name: 'The Boeing Company', sector: 'Industrials', exchange: 'NYSE' },
      { symbol: 'GE', name: 'General Electric Company', sector: 'Industrials', exchange: 'NYSE' },
      { symbol: 'CAT', name: 'Caterpillar Inc.', sector: 'Industrials', exchange: 'NYSE' },
      
      // Telecommunications
      { symbol: 'VZ', name: 'Verizon Communications Inc.', sector: 'Communication Services', exchange: 'NYSE' },
      { symbol: 'T', name: 'AT&T Inc.', sector: 'Communication Services', exchange: 'NYSE' },
      
      // Real Estate
      { symbol: 'AMT', name: 'American Tower Corporation', sector: 'Real Estate', exchange: 'NYSE' },
      
      // Utilities
      { symbol: 'NEE', name: 'NextEra Energy Inc.', sector: 'Utilities', exchange: 'NYSE' },
      
      // Materials
      { symbol: 'LIN', name: 'Linde plc', sector: 'Materials', exchange: 'NYSE' },
      
      // Popular ETFs
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', sector: 'ETF', exchange: 'NYSE' },
      { symbol: 'QQQ', name: 'Invesco QQQ Trust', sector: 'ETF', exchange: 'NASDAQ' },
      { symbol: 'IWM', name: 'iShares Russell 2000 ETF', sector: 'ETF', exchange: 'NYSE' },
      { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', sector: 'ETF', exchange: 'NYSE' },
      { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', sector: 'ETF', exchange: 'NYSE' },
      { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', sector: 'ETF', exchange: 'NYSE' },
      { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', sector: 'ETF', exchange: 'NYSE' },
      { symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', sector: 'ETF', exchange: 'NYSE' },
      { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', sector: 'ETF', exchange: 'NASDAQ' },
      { symbol: 'GLD', name: 'SPDR Gold Shares', sector: 'ETF', exchange: 'NYSE' },
    ];
  }

  /**
   * Get popular/trending stocks for quick search suggestions
   * @returns {Array} - Array of popular stock objects
   */
  getPopularStocks() {
    return [
      { symbol: 'AAPL', name: 'Apple Inc.' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.' },
      { symbol: 'MSFT', name: 'Microsoft Corporation' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.' },
      { symbol: 'TSLA', name: 'Tesla Inc.' },
      { symbol: 'META', name: 'Meta Platforms Inc.' },
      { symbol: 'NFLX', name: 'Netflix Inc.' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    ];
  }

  /**
   * Get stock suggestions based on partial input
   * @param {string} query - Partial search query
   * @returns {Array} - Array of suggested stock objects
   */
  getSuggestions(query) {
    if (!query || query.trim().length < 1) {
      return this.getPopularStocks();
    }

    const results = this.performLocalSearch(query.trim().toUpperCase());
    return results.slice(0, 8); // Limit suggestions to 8 items
  }

  /**
   * Clear search cache
   */
  async clearSearchCache() {
    try {
      const keys = await cacheService.getAllKeys();
      const searchKeys = keys.filter(key => key.startsWith(CACHE_KEYS.SEARCH_RESULTS));
      
      for (const key of searchKeys) {
        await cacheService.remove(key.replace('cache_', ''));
      }
      
      console.log('Search cache cleared');
    } catch (error) {
      console.error('Error clearing search cache:', error);
    }
  }
}

export default new SearchService();
