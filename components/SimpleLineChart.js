import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  Platform,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const SimpleLineChart = ({ data = [], width, height = 200, color = '#00C853' }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset and animate the chart
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: Platform.OS === 'android' ? 1000 : 1500, // Shorter animation on Android
      useNativeDriver: false,
    }).start();
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.noDataText}>No chart data available</Text>
      </View>
    );
  }

  // Prepare data for rendering
  const containerWidth = (width || screenWidth) - 32; // Account for container padding
  const containerHeight = height - 80; // Account for headers and labels
  const chartPadding = 20; // Internal padding for the chart area
  const chartWidth = containerWidth - (chartPadding * 2);
  const chartHeight = containerHeight - (chartPadding * 2);
  
  // Find min and max values from price data
  const values = data.map(item => parseFloat(item.price) || 0);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  // Calculate points for the line with proper padding
  const points = data.map((item, index) => {
    const x = chartPadding + (index / Math.max(data.length - 1, 1)) * chartWidth;
    const normalizedValue = valueRange > 0 ? (parseFloat(item.price) - minValue) / valueRange : 0;
    const y = chartPadding + (chartHeight - (normalizedValue * chartHeight));
    return { 
      x: Math.max(0, Math.min(x, containerWidth)), // Clamp x within bounds
      y: Math.max(0, Math.min(y, containerHeight)), // Clamp y within bounds
      value: item.price, 
      date: item.date 
    };
  });

  // Create animated line segments
  const renderLineSegments = () => {
    const segments = [];
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      
      if (!start || !end || typeof start.x !== 'number' || typeof start.y !== 'number' ||
          typeof end.x !== 'number' || typeof end.y !== 'number') {
        continue; // Skip invalid points
      }
      
      const lineLength = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
      );
      
      if (lineLength === 0) continue; // Skip zero-length lines
      
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      
      segments.push(
        <Animated.View
          key={i}
          style={[
            styles.lineSegment,
            {
              left: start.x,
              top: start.y,
              width: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, lineLength],
                extrapolate: 'clamp',
              }),
              transform: [{ rotate: `${angle}rad` }],
              backgroundColor: color,
            },
          ]}
        />
      );
    }
    return segments;
  };

  // Create animated dots for data points
  const renderDataPoints = () => {
    return points.map((point, index) => (
      <Animated.View
        key={index}
        style={[
          styles.dataPoint,
          {
            left: point.x - 4, // Center the 8px dot
            top: point.y - 4,  // Center the 8px dot
            backgroundColor: color,
            opacity: animatedValue.interpolate({
              inputRange: [0, 0.8, 1],
              outputRange: [0, 0, 1],
              extrapolate: 'clamp',
            }),
            transform: [
              {
                scale: animatedValue.interpolate({
                  inputRange: [0, 0.8, 1],
                  outputRange: [0, 0, 1],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      />
    ));
  };

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Price Chart</Text>
        <View style={styles.priceRange}>
          <Text style={styles.maxPrice}>${maxValue.toFixed(2)}</Text>
          <Text style={styles.minPrice}>${minValue.toFixed(2)}</Text>
        </View>
      </View>
      
      <View style={[styles.chartContainer, { width: containerWidth, height: containerHeight }]}>
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <View
            key={`h-${index}`}
            style={[
              styles.gridLine,
              {
                top: chartPadding + (ratio * chartHeight),
                left: chartPadding,
                width: chartWidth,
              },
            ]}
          />
        ))}
        
        {/* Vertical grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <View
            key={`v-${index}`}
            style={[
              styles.verticalGridLine,
              {
                left: chartPadding + (ratio * chartWidth),
                top: chartPadding,
                height: chartHeight,
              },
            ]}
          />
        ))}
        
        {/* Line segments */}
        {renderLineSegments()}
        
        {/* Data points */}
        {renderDataPoints()}
      </View>
      
      {/* X-axis labels */}
      <View style={styles.xAxisContainer}>
        <Text style={styles.xAxisLabel}>
          {data[0]?.date ? new Date(data[0].date).toLocaleDateString() : 'Start'}
        </Text>
        <Text style={styles.xAxisLabel}>
          {data[data.length - 1]?.date 
            ? new Date(data[data.length - 1].date).toLocaleDateString() 
            : 'End'
          }
        </Text>
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 80,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  priceRange: {
    alignItems: 'flex-end',
  },
  maxPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#00C853',
  },
  minPrice: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  chartContainer: {
    position: 'relative',
    marginBottom: 16,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden', // Ensure content stays within bounds
  },
  gridLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#e8e8e8',
    opacity: 0.6,
  },
  verticalGridLine: {
    position: 'absolute',
    width: 1,
    backgroundColor: '#e8e8e8',
    opacity: 0.4,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
    borderRadius: 1,
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  xAxisContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  xAxisLabel: {
    fontSize: 12,
    color: '#666',
  },
});

export default SimpleLineChart;
