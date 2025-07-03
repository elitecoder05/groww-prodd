import { useState, useEffect } from 'react';
import stockService from '../services/stockService';

/**
 * Custom hook for managing stock chart data
 * @param {string} symbol - Stock symbol
 * @returns {Object} - Chart data and state management
 */
export const useStockChart = (symbol) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('1M');

  const fetchChartData = async (period = selectedPeriod) => {
    if (!symbol) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await stockService.fetchChartData(symbol, period);
      setChartData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching chart data:', err);
    } finally {
      setLoading(false);
    }
  };

  const changePeriod = (period) => {
    setSelectedPeriod(period);
    fetchChartData(period);
  };

  const refreshData = () => {
    fetchChartData(selectedPeriod);
  };

  useEffect(() => {
    if (symbol) {
      fetchChartData();
    }
  }, [symbol]);

  return {
    chartData,
    loading,
    error,
    selectedPeriod,
    changePeriod,
    refreshData,
  };
};
