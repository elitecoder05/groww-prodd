import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

const StockChart = ({ 
  data = [], 
  width = screenWidth - 32, 
  height = 220, 
  color = '#00D09C',
  period = '1M',
  showDetails = true 
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height, width }]}>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No chart data available</Text>
          <Text style={styles.noDataSubtext}>Try refreshing or selecting a different period</Text>
        </View>
      </View>
    );
  }

  // Prepare data for react-native-chart-kit
  const chartData = {
    labels: data.length > 10 
      ? data.filter((_, index) => index % Math.ceil(data.length / 6) === 0).map(item => {
          const date = new Date(item.date);
          return period === '1W' || period === '1M' 
            ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        })
      : data.map(item => {
          const date = new Date(item.date);
          return period === '1W' 
            ? date.toLocaleDateString('en-US', { weekday: 'short' })
            : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
    datasets: [
      {
        data: data.map(item => item.price),
        color: (opacity = 1) => color,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity * 0.6})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity * 0.7})`,
    style: {
      borderRadius: 8,
    },
    propsForDots: {
      r: '0', // Hide dots for cleaner look
    },
    propsForBackgroundLines: {
      strokeDasharray: '', // Solid grid lines
      stroke: '#e0e0e0',
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 12,
    },
    formatYLabel: (value) => {
      const num = parseFloat(value);
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
      }
      return num.toFixed(0);
    },
    formatXLabel: (value) => value,
  };

  // Calculate price change
  const startPrice = data[0]?.price || 0;
  const endPrice = data[data.length - 1]?.price || 0;
  const priceChange = endPrice - startPrice;
  const percentChange = startPrice !== 0 ? ((priceChange / startPrice) * 100) : 0;
  const isPositive = priceChange >= 0;

  // Calculate min and max for the period
  const prices = data.map(item => item.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return (
    <View style={[styles.container, { width }]}>
      {showDetails && (
        <View style={styles.chartHeader}>
          <View style={styles.priceInfo}>
            <Text style={styles.currentPrice}>${endPrice.toFixed(2)}</Text>
            <Text style={[
              styles.priceChange, 
              { color: isPositive ? '#00C851' : '#FF4444' }
            ]}>
              {isPositive ? '+' : ''}${priceChange.toFixed(2)} ({isPositive ? '+' : ''}{percentChange.toFixed(2)}%)
            </Text>
          </View>
          <View style={styles.periodStats}>
            <Text style={styles.statText}>H: ${maxPrice.toFixed(2)}</Text>
            <Text style={styles.statText}>L: ${minPrice.toFixed(2)}</Text>
          </View>
        </View>
      )}
      
      <View style={styles.chartWrapper}>
        <LineChart
          data={chartData}
          width={width}
          height={height - (showDetails ? 60 : 20)}
          chartConfig={chartConfig}
          bezier={false}
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          withDots={false}
          withShadow={false}
          segments={4}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  priceInfo: {
    flex: 1,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  priceChange: {
    fontSize: 16,
    fontWeight: '600',
  },
  periodStats: {
    alignItems: 'flex-end',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  chartWrapper: {
    alignItems: 'center',
    marginHorizontal: -16, // Extend chart to edges
  },
  chart: {
    borderRadius: 8,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default StockChart;
