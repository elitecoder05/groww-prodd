import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useStocks } from '../hooks/useStocks';

// Remove dummy data - now using real API data

const StockCard = ({ stock, onPress }) => {
  const isGainer = stock.change && !stock.change.startsWith('-');
  const changeColor = isGainer ? '#00C851' : '#FF4444';
  
  return (
    <TouchableOpacity style={styles.stockCard} onPress={() => onPress(stock)}>
      <View style={styles.stockIcon} />
      <Text style={styles.stockName} numberOfLines={1}>{stock.name}</Text>
      <Text style={styles.stockPrice}>{stock.price}</Text>
      {stock.change && (
        <Text style={[styles.stockChange, { color: changeColor }]}>
          {stock.change}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const SectionHeader = ({ title, onViewAll }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <TouchableOpacity onPress={onViewAll}>
      <Text style={styles.viewAllText}>View All</Text>
    </TouchableOpacity>
  </View>
);

export default function StocksScreen({ navigation }) {
  const { stocks, loading, error, lastUpdated, refreshStocks } = useStocks();

  useEffect(() => {
    navigation.setOptions({
      title: 'Stocks',
      headerStyle: {
        backgroundColor: '#00D09C',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 18,
      },
      headerShown: true,
    });
  }, [navigation]);

  const handleViewAll = (section) => {
    navigation.navigate('StockList', { type: section });
  };

  const handleStockPress = (stock) => {
    navigation.navigate('CompanyOverview', {
      symbol: stock.ticker,
      currentPrice: stock.price,
      change: stock.change,
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00D09C" />
        <Text style={styles.loadingText}>Loading stock data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshStocks}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refreshStocks} />
      }
    >
      {/* Last Updated Info */}
      {lastUpdated && (
        <Text style={styles.lastUpdated}>
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </Text>
      )}

      {/* Top Gainers Section */}
      <SectionHeader 
        title="Top Gainers" 
        onViewAll={() => handleViewAll('gainers')} 
      />
      <View style={styles.stockGrid}>
        {stocks.topGainers.slice(0, 4).map((stock) => (
          <StockCard key={stock.id} stock={stock} onPress={handleStockPress} />
        ))}
      </View>

      {/* Top Losers Section */}
      <SectionHeader 
        title="Top Losers" 
        onViewAll={() => handleViewAll('losers')} 
      />
      <View style={styles.stockGrid}>
        {stocks.topLosers.slice(0, 4).map((stock) => (
          <StockCard key={stock.id} stock={stock} onPress={handleStockPress} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingTop: 20,
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
    fontSize: 16,
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: 16,
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
  lastUpdated: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#00D09C',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  stockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  stockCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  stockIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  stockName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stockPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  stockChange: {
    fontSize: 12,
    fontWeight: '600',
  },
});
