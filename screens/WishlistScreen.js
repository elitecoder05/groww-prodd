import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWishlist } from '../hooks/useWishlist';

const WishlistCard = ({ wishlist, onPress, onDelete }) => (
  <TouchableOpacity style={styles.wishlistCard} onPress={() => onPress(wishlist)}>
    <View style={styles.wishlistHeader}>
      <View style={styles.wishlistIcon}>
        <Ionicons name="heart" size={20} color="#00D09C" />
      </View>
      <View style={styles.wishlistInfo}>
        <Text style={styles.wishlistName}>{wishlist.name}</Text>
        <Text style={styles.wishlistCount}>
          {wishlist.stocks.length} stock{wishlist.stocks.length !== 1 ? 's' : ''}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => onDelete(wishlist)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={20} color="#FF4444" />
      </TouchableOpacity>
    </View>
    
    {wishlist.stocks.length > 0 && (
      <View style={styles.stocksPreview}>
        {wishlist.stocks.slice(0, 3).map((stock, index) => (
          <View key={index} style={styles.stockPreviewItem}>
            <Text style={styles.stockSymbol}>{stock.symbol}</Text>
            <Text style={styles.stockPrice}>{stock.price}</Text>
          </View>
        ))}
        {wishlist.stocks.length > 3 && (
          <Text style={styles.moreStocks}>+{wishlist.stocks.length - 3} more</Text>
        )}
      </View>
    )}
  </TouchableOpacity>
);

const EmptyState = ({ onCreateWishlist }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="heart-outline" size={80} color="#ccc" />
    <Text style={styles.emptyTitle}>No Wishlists Yet</Text>
    <Text style={styles.emptySubtitle}>
      Create your first wishlist to track your favorite stocks
    </Text>
    <TouchableOpacity style={styles.createButton} onPress={onCreateWishlist}>
      <Ionicons name="add" size={20} color="#fff" />
      <Text style={styles.createButtonText}>Create Wishlist</Text>
    </TouchableOpacity>
  </View>
);

export default function WishlistScreen({ navigation }) {
  const { 
    wishlists, 
    loading, 
    error, 
    refreshWishlists, 
    deleteWishlist,
    createWishlist,
  } = useWishlist();
  
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshWishlists();
    setRefreshing(false);
  };

  const handleCreateWishlist = () => {
    Alert.prompt(
      'Create Wishlist',
      'Enter a name for your new wishlist',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Create',
          onPress: async (name) => {
            if (name && name.trim()) {
              try {
                await createWishlist(name.trim());
                Alert.alert('Success', 'Wishlist created successfully');
              } catch (error) {
                Alert.alert('Error', error.message || 'Failed to create wishlist');
              }
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleWishlistPress = (wishlist) => {
    // Navigate to wishlist details or handle wishlist selection
    // For now, we'll show an alert with wishlist info
    Alert.alert(
      wishlist.name,
      `This wishlist contains ${wishlist.stocks.length} stock${wishlist.stocks.length !== 1 ? 's' : ''}:\n\n${wishlist.stocks.map(s => `• ${s.symbol} - ${s.name}`).join('\n')}`,
      [{ text: 'OK' }]
    );
  };

  const handleDeleteWishlist = (wishlist) => {
    Alert.alert(
      'Delete Wishlist',
      `Are you sure you want to delete "${wishlist.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWishlist(wishlist.id);
              Alert.alert('Success', 'Wishlist deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete wishlist');
            }
          },
        },
      ]
    );
  };

  const renderWishlist = ({ item }) => (
    <WishlistCard 
      wishlist={item} 
      onPress={handleWishlistPress}
      onDelete={handleDeleteWishlist}
    />
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D09C" />
          <Text style={styles.loadingText}>Loading wishlists...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && wishlists.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF4444" />
          <Text style={styles.errorText}>Error loading wishlists</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshWishlists}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Wishlists</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateWishlist}>
          <Ionicons name="add" size={24} color="#00D09C" />
        </TouchableOpacity>
      </View>

      {wishlists.length === 0 ? (
        <EmptyState onCreateWishlist={handleCreateWishlist} />
      ) : (
        <FlatList
          data={wishlists}
          renderItem={renderWishlist}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#00D09C']}
              tintColor="#00D09C"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
  wishlistCard: {
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
  wishlistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  wishlistIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  wishlistInfo: {
    flex: 1,
  },
  wishlistName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  wishlistCount: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 4,
  },
  stocksPreview: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  stockPreviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  stockSymbol: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  stockPrice: {
    fontSize: 14,
    color: '#666',
  },
  moreStocks: {
    fontSize: 12,
    color: '#00D09C',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00D09C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF4444',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
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
});
