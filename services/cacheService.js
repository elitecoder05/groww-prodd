import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'cache_';
const DEFAULT_EXPIRATION = 5 * 60 * 1000; // 5 minutes in milliseconds

class CacheService {
  /**
   * Set data in cache with expiration
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} expirationMs - Expiration time in milliseconds (default: 5 minutes)
   */
  async set(key, data, expirationMs = DEFAULT_EXPIRATION) {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        expiration: Date.now() + expirationMs,
      };
      
      await AsyncStorage.setItem(
        `${CACHE_PREFIX}${key}`, 
        JSON.stringify(cacheItem)
      );
      
      console.log(`Cache set for key: ${key}, expires in ${expirationMs}ms`);
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  /**
   * Get data from cache if not expired
   * @param {string} key - Cache key
   * @returns {any|null} - Cached data or null if expired/not found
   */
  async get(key) {
    try {
      const cachedItem = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      
      if (!cachedItem) {
        console.log(`Cache miss for key: ${key}`);
        return null;
      }

      const { data, timestamp, expiration } = JSON.parse(cachedItem);
      const now = Date.now();

      if (now > expiration) {
        console.log(`Cache expired for key: ${key}`);
        await this.remove(key); // Clean up expired cache
        return null;
      }

      console.log(`Cache hit for key: ${key}, age: ${(now - timestamp) / 1000}s`);
      return data;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  /**
   * Remove item from cache
   * @param {string} key - Cache key
   */
  async remove(key) {
    try {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
      console.log(`Cache removed for key: ${key}`);
    } catch (error) {
      console.error('Error removing cache:', error);
    }
  }

  /**
   * Check if cache exists and is valid
   * @param {string} key - Cache key
   * @returns {boolean} - True if cache exists and is valid
   */
  async isValid(key) {
    try {
      const cachedItem = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      
      if (!cachedItem) {
        return false;
      }

      const { expiration } = JSON.parse(cachedItem);
      return Date.now() <= expiration;
    } catch (error) {
      console.error('Error checking cache validity:', error);
      return false;
    }
  }

  /**
   * Get cache age in seconds
   * @param {string} key - Cache key
   * @returns {number|null} - Age in seconds or null if not found
   */
  async getAge(key) {
    try {
      const cachedItem = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      
      if (!cachedItem) {
        return null;
      }

      const { timestamp } = JSON.parse(cachedItem);
      return (Date.now() - timestamp) / 1000;
    } catch (error) {
      console.error('Error getting cache age:', error);
      return null;
    }
  }

  /**
   * Clear all cache data
   */
  async clearAll() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        console.log(`Cleared ${cacheKeys.length} cache items`);
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Clear expired cache items
   */
  async clearExpired() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      const expiredKeys = [];

      for (const key of cacheKeys) {
        const cachedItem = await AsyncStorage.getItem(key);
        if (cachedItem) {
          const { expiration } = JSON.parse(cachedItem);
          if (Date.now() > expiration) {
            expiredKeys.push(key);
          }
        }
      }

      if (expiredKeys.length > 0) {
        await AsyncStorage.multiRemove(expiredKeys);
        console.log(`Cleared ${expiredKeys.length} expired cache items`);
      }
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  async getStats() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      
      let totalItems = 0;
      let validItems = 0;
      let expiredItems = 0;
      let totalSize = 0;

      for (const key of cacheKeys) {
        const cachedItem = await AsyncStorage.getItem(key);
        if (cachedItem) {
          totalItems++;
          totalSize += cachedItem.length;
          
          const { expiration } = JSON.parse(cachedItem);
          if (Date.now() <= expiration) {
            validItems++;
          } else {
            expiredItems++;
          }
        }
      }

      return {
        totalItems,
        validItems,
        expiredItems,
        totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalItems: 0,
        validItems: 0,
        expiredItems: 0,
        totalSize: '0 KB',
      };
    }
  }
}

export default new CacheService();
