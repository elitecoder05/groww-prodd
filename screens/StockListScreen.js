import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStocks } from '../hooks/useStocks';

const ITEMS_PER_PAGE = 10;

const StockListItem = ({ stock, onPress }) => {
  const isGainer = stock.change && !stock.change.startsWith('-');
  const changeColor = isGainer ? '#00C851' : '#FF4444';
  const changeIcon = isGainer ? 'trending-up' : 'trending-down';

  return (
    <TouchableOpacity style={styles.stockItem} onPress={() => onPress(stock)}>
      <View style={styles.stockInfo}>
        <View style={styles.stockHeader}>
          <Text style={styles.stockTicker}>{stock.ticker}</Text>
          <View style={styles.changeContainer}>
            <Ionicons name={changeIcon} size={16} color={changeColor} />
            <Text style={[styles.changeText, { color: changeColor }]}>
              {stock.change}
            </Text>
          </View>
        </View>
        <Text style={styles.stockName} numberOfLines={1}>
          {stock.name}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.stockPrice}>{stock.price}</Text>
          <Text style={[styles.changeAmount, { color: changeColor }]}>
            {isGainer ? '+' : ''}{stock.changeAmount}
          </Text>
        </View>
        <Text style={styles.volumeText}>
          Volume: {parseInt(stock.volume).toLocaleString()}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );
};

const PaginationControls = ({ currentPage, totalPages, onPageChange, loading }) => {
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[styles.paginationButton, !canGoPrev && styles.disabledButton]}
        onPress={() => canGoPrev && onPageChange(currentPage - 1)}
        disabled={!canGoPrev || loading}
      >
        <Ionicons name="chevron-back" size={20} color={canGoPrev ? '#00D09C' : '#ccc'} />
        <Text style={[styles.paginationText, !canGoPrev && styles.disabledText]}>
          Previous
        </Text>
      </TouchableOpacity>

      <View style={styles.pageInfo}>
        <Text style={styles.pageText}>
          Page {currentPage} of {totalPages}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.paginationButton, !canGoNext && styles.disabledButton]}
        onPress={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext || loading}
      >
        <Text style={[styles.paginationText, !canGoNext && styles.disabledText]}>
          Next
        </Text>
        <Ionicons name="chevron-forward" size={20} color={canGoNext ? '#00D09C' : '#ccc'} />
      </TouchableOpacity>
    </View>
  );
};

export default function StockListScreen({ route, navigation }) {
  const { type } = route.params; // 'gainers' or 'losers'
  const { stocks, loading, error, refreshStocks } = useStocks();
  const [currentPage, setCurrentPage] = useState(1);

  const title = type === 'gainers' ? 'Top Gainers' : 'Top Losers';
  const stockData = type === 'gainers' ? stocks.topGainers : stocks.topLosers;

  const totalPages = Math.ceil(stockData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPageData = stockData.slice(startIndex, endIndex);

  useEffect(() => {
    navigation.setOptions({
      title: title,
      headerStyle: {
        backgroundColor: '#00D09C',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  }, [navigation, title]);

  const handleStockPress = (stock) => {
    navigation.navigate('CompanyOverview', {
      symbol: stock.ticker,
      currentPrice: stock.price,
      change: stock.change,
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading && stockData.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00D09C" />
        <Text style={styles.loadingText}>Loading {title.toLowerCase()}...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={64} color="#FF4444" />
        <Text style={styles.errorText}>Error loading data</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshStocks}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (stockData.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="bar-chart" size={64} color="#ccc" />
        <Text style={styles.emptyText}>No {title.toLowerCase()} available</Text>
        <Text style={styles.emptySubtext}>Pull down to refresh</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Showing {startIndex + 1}-{Math.min(endIndex, stockData.length)} of {stockData.length} stocks
        </Text>
        <TouchableOpacity onPress={refreshStocks} disabled={loading}>
          <Ionicons 
            name="refresh" 
            size={24} 
            color={loading ? '#ccc' : '#00D09C'} 
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={currentPageData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <StockListItem stock={item} onPress={handleStockPress} />
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshStocks} />
        }
        ListFooterComponent={() => (
          totalPages > 1 ? (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              loading={loading}
            />
          ) : null
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF4444',
    textAlign: 'center',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#00D09C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  stockItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  stockInfo: {
    flex: 1,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stockTicker: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stockName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stockPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  changeAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  volumeText: {
    fontSize: 12,
    color: '#999',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00D09C',
  },
  disabledText: {
    color: '#ccc',
  },
  pageInfo: {
    alignItems: 'center',
  },
  pageText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
