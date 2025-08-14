import { useState, useEffect, useCallback } from 'react';
import wishlistService from '../services/wishlistService';

/**
 * Custom hook for managing wishlist data
 * @returns {Object} - Wishlist data and methods
 */
export const useWishlist = () => {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await wishlistService.getWishlists();
      setWishlists(data);
    } catch (err) {
      console.error('Error fetching wishlists:', err);
      setError(err.message || 'Failed to fetch wishlists');
    } finally {
      setLoading(false);
    }
  }, []);

  const createWishlist = useCallback(async (name) => {
    try {
      setError(null);
      const newWishlist = await wishlistService.createWishlist(name);
      setWishlists(prev => [...prev, newWishlist]);
      return newWishlist;
    } catch (err) {
      console.error('Error creating wishlist:', err);
      setError(err.message || 'Failed to create wishlist');
      throw err;
    }
  }, []);

  const deleteWishlist = useCallback(async (wishlistId) => {
    try {
      setError(null);
      const success = await wishlistService.deleteWishlist(wishlistId);
      if (success) {
        setWishlists(prev => prev.filter(w => w.id !== wishlistId));
      }
      return success;
    } catch (err) {
      console.error('Error deleting wishlist:', err);
      setError(err.message || 'Failed to delete wishlist');
      return false;
    }
  }, []);

  const addStockToWishlist = useCallback(async (wishlistId, stock) => {
    try {
      setError(null);
      await wishlistService.addStockToWishlist(wishlistId, stock);
      // Refresh wishlists to get updated data
      await fetchWishlists();
      return true;
    } catch (err) {
      console.error('Error adding stock to wishlist:', err);
      setError(err.message || 'Failed to add stock to wishlist');
      throw err;
    }
  }, [fetchWishlists]);

  const removeStockFromWishlist = useCallback(async (wishlistId, stockSymbol) => {
    try {
      setError(null);
      const success = await wishlistService.removeStockFromWishlist(wishlistId, stockSymbol);
      if (success) {
        // Refresh wishlists to get updated data
        await fetchWishlists();
      }
      return success;
    } catch (err) {
      console.error('Error removing stock from wishlist:', err);
      setError(err.message || 'Failed to remove stock from wishlist');
      return false;
    }
  }, [fetchWishlists]);

  const isStockInWishlist = useCallback(async (stockSymbol) => {
    try {
      const wishlistIds = await wishlistService.getWishlistsContainingStock(stockSymbol);
      return wishlistIds.length > 0;
    } catch (err) {
      console.error('Error checking if stock is in wishlist:', err);
      return false;
    }
  }, []);

  const getWishlistsContainingStock = useCallback(async (stockSymbol) => {
    try {
      return await wishlistService.getWishlistsContainingStock(stockSymbol);
    } catch (err) {
      console.error('Error getting wishlists containing stock:', err);
      return [];
    }
  }, []);

  const getAllWishlistStocks = useCallback(async () => {
    try {
      return await wishlistService.getAllWishlistStocks();
    } catch (err) {
      console.error('Error getting all wishlist stocks:', err);
      return [];
    }
  }, []);

  const updateStockPrices = useCallback(async (updatedStocks) => {
    try {
      const success = await wishlistService.updateStockPrices(updatedStocks);
      if (success) {
        // Refresh wishlists to get updated data
        await fetchWishlists();
      }
      return success;
    } catch (err) {
      console.error('Error updating stock prices:', err);
      return false;
    }
  }, [fetchWishlists]);

  useEffect(() => {
    fetchWishlists();
  }, [fetchWishlists]);

  return {
    wishlists,
    loading,
    error,
    refreshWishlists: fetchWishlists,
    createWishlist,
    deleteWishlist,
    addStockToWishlist,
    removeStockFromWishlist,
    isStockInWishlist,
    getWishlistsContainingStock,
    getAllWishlistStocks,
    updateStockPrices,
  };
};
