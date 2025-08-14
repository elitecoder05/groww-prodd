import AsyncStorage from '@react-native-async-storage/async-storage';

const WISHLIST_KEY = 'stock_wishlists';

class WishlistService {
  constructor() {
    this.cache = null;
    this.lastFetch = null;
  }

  /**
   * Get all wishlists from AsyncStorage
   * @returns {Promise<Array>} Array of wishlist objects
   */
  async getWishlists() {
    try {
      const data = await AsyncStorage.getItem(WISHLIST_KEY);
      const wishlists = data ? JSON.parse(data) : [];
      this.cache = wishlists;
      this.lastFetch = Date.now();
      return wishlists;
    } catch (error) {
      console.error('Error getting wishlists:', error);
      return [];
    }
  }

  /**
   * Create a new wishlist
   * @param {string} name - Wishlist name
   * @returns {Promise<Object>} Created wishlist object
   */
  async createWishlist(name) {
    try {
      const wishlists = await this.getWishlists();
      const newWishlist = {
        id: Date.now().toString(),
        name: name.trim(),
        stocks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      wishlists.push(newWishlist);
      await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlists));
      this.cache = wishlists;
      
      return newWishlist;
    } catch (error) {
      console.error('Error creating wishlist:', error);
      throw new Error('Failed to create wishlist');
    }
  }

  /**
   * Delete a wishlist
   * @param {string} wishlistId - Wishlist ID to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteWishlist(wishlistId) {
    try {
      const wishlists = await this.getWishlists();
      const filteredWishlists = wishlists.filter(w => w.id !== wishlistId);
      
      await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(filteredWishlists));
      this.cache = filteredWishlists;
      
      return true;
    } catch (error) {
      console.error('Error deleting wishlist:', error);
      return false;
    }
  }

  /**
   * Add stock to wishlist
   * @param {string} wishlistId - Wishlist ID
   * @param {Object} stock - Stock object to add
   * @returns {Promise<boolean>} Success status
   */
  async addStockToWishlist(wishlistId, stock) {
    try {
      const wishlists = await this.getWishlists();
      const wishlistIndex = wishlists.findIndex(w => w.id === wishlistId);
      
      if (wishlistIndex === -1) {
        throw new Error('Wishlist not found');
      }

      const wishlist = wishlists[wishlistIndex];
      const stockExists = wishlist.stocks.some(s => s.symbol === stock.symbol);
      
      if (stockExists) {
        throw new Error('Stock already exists in this wishlist');
      }

      const stockToAdd = {
        symbol: stock.symbol || stock.ticker,
        name: stock.name,
        price: stock.price,
        change: stock.change,
        addedAt: new Date().toISOString(),
      };

      wishlist.stocks.push(stockToAdd);
      wishlist.updatedAt = new Date().toISOString();
      
      await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlists));
      this.cache = wishlists;
      
      return true;
    } catch (error) {
      console.error('Error adding stock to wishlist:', error);
      throw error;
    }
  }

  /**
   * Remove stock from wishlist
   * @param {string} wishlistId - Wishlist ID
   * @param {string} stockSymbol - Stock symbol to remove
   * @returns {Promise<boolean>} Success status
   */
  async removeStockFromWishlist(wishlistId, stockSymbol) {
    try {
      const wishlists = await this.getWishlists();
      const wishlistIndex = wishlists.findIndex(w => w.id === wishlistId);
      
      if (wishlistIndex === -1) {
        throw new Error('Wishlist not found');
      }

      const wishlist = wishlists[wishlistIndex];
      wishlist.stocks = wishlist.stocks.filter(s => s.symbol !== stockSymbol);
      wishlist.updatedAt = new Date().toISOString();
      
      await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlists));
      this.cache = wishlists;
      
      return true;
    } catch (error) {
      console.error('Error removing stock from wishlist:', error);
      return false;
    }
  }

  /**
   * Check if stock is in any wishlist
   * @param {string} stockSymbol - Stock symbol to check
   * @returns {Promise<Array>} Array of wishlist IDs containing the stock
   */
  async getWishlistsContainingStock(stockSymbol) {
    try {
      const wishlists = await this.getWishlists();
      return wishlists
        .filter(wishlist => 
          wishlist.stocks.some(stock => stock.symbol === stockSymbol)
        )
        .map(wishlist => wishlist.id);
    } catch (error) {
      console.error('Error checking wishlists for stock:', error);
      return [];
    }
  }

  /**
   * Get all stocks across all wishlists
   * @returns {Promise<Array>} Array of all wishlist stocks with wishlist info
   */
  async getAllWishlistStocks() {
    try {
      const wishlists = await this.getWishlists();
      const allStocks = [];
      
      wishlists.forEach(wishlist => {
        wishlist.stocks.forEach(stock => {
          allStocks.push({
            ...stock,
            wishlistId: wishlist.id,
            wishlistName: wishlist.name,
          });
        });
      });
      
      return allStocks;
    } catch (error) {
      console.error('Error getting all wishlist stocks:', error);
      return [];
    }
  }

  /**
   * Update stock prices in all wishlists
   * @param {Array} updatedStocks - Array of stocks with updated prices
   * @returns {Promise<boolean>} Success status
   */
  async updateStockPrices(updatedStocks) {
    try {
      const wishlists = await this.getWishlists();
      let hasUpdates = false;

      wishlists.forEach(wishlist => {
        wishlist.stocks.forEach(stock => {
          const updatedStock = updatedStocks.find(s => 
            s.symbol === stock.symbol || s.ticker === stock.symbol
          );
          
          if (updatedStock) {
            stock.price = updatedStock.price;
            stock.change = updatedStock.change;
            stock.lastUpdated = new Date().toISOString();
            hasUpdates = true;
          }
        });
      });

      if (hasUpdates) {
        await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlists));
        this.cache = wishlists;
      }

      return true;
    } catch (error) {
      console.error('Error updating stock prices:', error);
      return false;
    }
  }

  /**
   * Clear all wishlist data (useful for debugging)
   * @returns {Promise<boolean>} Success status
   */
  async clearAllWishlists() {
    try {
      await AsyncStorage.removeItem(WISHLIST_KEY);
      this.cache = null;
      return true;
    } catch (error) {
      console.error('Error clearing wishlists:', error);
      return false;
    }
  }
}

export default new WishlistService();
