import { API_CONFIG } from '../config/api';

class ApiService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.apiKey = API_CONFIG.API_KEY;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Generic API call method
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Additional parameters
   * @param {Object} options - Request options
   * @returns {Promise} - API response
   */
  async makeRequest(endpoint, params = {}, options = {}) {
    try {
      // Construct URL with parameters
      const url = new URL(this.baseUrl);
      url.searchParams.append('function', endpoint);
      url.searchParams.append('apikey', this.apiKey);
      
      // Add additional parameters
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });

      console.log('Making API request to:', url.toString());

      // Make the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Check for API-specific errors
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }
      
      if (data['Note']) {
        throw new Error('API call frequency limit reached. Please try again later.');
      }

      return {
        success: true,
        data,
        status: response.status,
      };

    } catch (error) {
      console.error('API Request failed:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your internet connection');
      }
      
      return {
        success: false,
        error: error.message,
        status: error.status || 500,
      };
    }
  }

  /**
   * Get top gainers and losers
   * @returns {Promise} - Top gainers and losers data
   */
  async getTopGainersLosers() {
    return this.makeRequest(API_CONFIG.ENDPOINTS.TOP_GAINERS_LOSERS);
  }

  /**
   * Get company overview by symbol
   * @param {string} symbol - Stock symbol
   * @returns {Promise} - Company overview data
   */
  async getCompanyOverview(symbol) {
    return this.makeRequest(API_CONFIG.ENDPOINTS.COMPANY_OVERVIEW, { symbol });
  }

  /**
   * Get daily time series data
   * @param {string} symbol - Stock symbol
   * @param {string} outputsize - 'compact' (last 100 days) or 'full' (20+ years)
   * @returns {Promise} - Time series data
   */
  async getDailyTimeSeries(symbol, outputsize = 'compact') {
    return this.makeRequest(API_CONFIG.ENDPOINTS.TIME_SERIES_DAILY, { 
      symbol, 
      outputsize 
    });
  }

  /**
   * Get weekly time series data
   * @param {string} symbol - Stock symbol
   * @returns {Promise} - Weekly time series data
   */
  async getWeeklyTimeSeries(symbol) {
    return this.makeRequest(API_CONFIG.ENDPOINTS.TIME_SERIES_WEEKLY, { symbol });
  }

  /**
   * Get monthly time series data
   * @param {string} symbol - Stock symbol
   * @returns {Promise} - Monthly time series data
   */
  async getMonthlyTimeSeries(symbol) {
    return this.makeRequest(API_CONFIG.ENDPOINTS.TIME_SERIES_MONTHLY, { symbol });
  }

  /**
   * Get intraday time series data
   * @param {string} symbol - Stock symbol
   * @param {string} interval - '1min', '5min', '15min', '30min', '60min'
   * @returns {Promise} - Intraday time series data
   */
  async getIntradayTimeSeries(symbol, interval = '60min') {
    return this.makeRequest(API_CONFIG.ENDPOINTS.TIME_SERIES_INTRADAY, { 
      symbol, 
      interval 
    });
  }
}

// Export singleton instance
export default new ApiService();
