import { useState, useEffect } from 'react';
import stockService from '../services/stockService';

/**
 * Custom hook for managing stock data
 * @returns {Object} - Stock data and loading states
 */
export const useStocks = () => {
  const [stocks, setStocks] = useState({
    topGainers: [],
    topLosers: [],
    mostActive: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching stocks data...');
      const data = await stockService.fetchTopGainersLosers();
      console.log('Stocks data received:', data);
      
      setStocks({
        topGainers: data.topGainers || [],
        topLosers: data.topLosers || [],
        mostActive: data.mostActive || [],
      });
      
      setLastUpdated(data.lastUpdated || new Date().toISOString());
    } catch (err) {
      console.error('Error in useStocks hook:', err);
      setError(err.message || 'Failed to fetch stock data');
      
      // Set empty arrays as fallback
      setStocks({
        topGainers: [],
        topLosers: [],
        mostActive: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshStocks = () => {
    fetchStocks();
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  return {
    stocks,
    loading,
    error,
    lastUpdated,
    refreshStocks,
  };
};
