import { useState, useEffect } from 'react';
import stockService from '../services/stockService';

/**
 * Custom hook for managing company overview data
 * @param {string} symbol - Stock symbol
 * @returns {Object} - Company overview data and loading states
 */
export const useCompanyOverview = (symbol) => {
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompanyOverview = async () => {
    if (!symbol) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await stockService.fetchCompanyOverview(symbol);
      setCompanyData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error in useCompanyOverview hook:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchCompanyOverview();
  };

  useEffect(() => {
    fetchCompanyOverview();
  }, [symbol]);

  return {
    companyData,
    loading,
    error,
    refreshData,
  };
};
