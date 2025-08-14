import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import { useWishlist } from '../hooks/useWishlist';

const WishlistModal = ({ isVisible, onClose, stock, onSuccess }) => {
  const [selectedTab, setSelectedTab] = useState('existing'); // 'existing' or 'new'
  const [newWishlistName, setNewWishlistName] = useState('');
  const [selectedWishlistId, setSelectedWishlistId] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    wishlists,
    loading: wishlistLoading,
    createWishlist,
    addStockToWishlist,
  } = useWishlist();

  useEffect(() => {
    if (isVisible) {
      // Reset form when modal opens
      setSelectedTab(wishlists.length > 0 ? 'existing' : 'new');
      setNewWishlistName('');
      setSelectedWishlistId(null);
    }
  }, [isVisible, wishlists.length]);

  const handleAddToExistingWishlist = async () => {
    if (!selectedWishlistId) {
      Alert.alert('Error', 'Please select a wishlist');
      return;
    }

    try {
      setLoading(true);
      await addStockToWishlist(selectedWishlistId, stock);
      Alert.alert('Success', 'Stock added to wishlist successfully');
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add stock to wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewWishlist = async () => {
    if (!newWishlistName.trim()) {
      Alert.alert('Error', 'Please enter a wishlist name');
      return;
    }

    try {
      setLoading(true);
      const newWishlist = await createWishlist(newWishlistName.trim());
      await addStockToWishlist(newWishlist.id, stock);
      Alert.alert('Success', 'New wishlist created and stock added successfully');
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (selectedTab === 'existing') {
      handleAddToExistingWishlist();
    } else {
      handleCreateNewWishlist();
    }
  };

  const renderWishlistItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.wishlistItem,
        selectedWishlistId === item.id && styles.selectedWishlistItem
      ]}
      onPress={() => setSelectedWishlistId(item.id)}
    >
      <View style={styles.wishlistItemContent}>
        <Text style={styles.wishlistName}>{item.name}</Text>
        <Text style={styles.wishlistStockCount}>
          {item.stocks.length} stock{item.stocks.length !== 1 ? 's' : ''}
        </Text>
      </View>
      <View style={[
        styles.radioButton,
        selectedWishlistId === item.id && styles.radioButtonSelected
      ]}>
        {selectedWishlistId === item.id && (
          <Ionicons name="checkmark" size={16} color="#fff" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
    >
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add to Wishlist</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Stock Info */}
        <View style={styles.stockInfo}>
          <View style={styles.stockIcon}>
            <Text style={styles.stockIconText}>
              {stock?.symbol?.charAt(0) || stock?.ticker?.charAt(0) || '?'}
            </Text>
          </View>
          <View style={styles.stockDetails}>
            <Text style={styles.stockName}>{stock?.name || 'Unknown Stock'}</Text>
            <Text style={styles.stockSymbol}>
              {stock?.symbol || stock?.ticker || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'existing' && styles.activeTab,
              wishlists.length === 0 && styles.disabledTab
            ]}
            onPress={() => wishlists.length > 0 && setSelectedTab('existing')}
            disabled={wishlists.length === 0}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'existing' && styles.activeTabText,
              wishlists.length === 0 && styles.disabledTabText
            ]}>
              Existing Wishlist ({wishlists.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'new' && styles.activeTab]}
            onPress={() => setSelectedTab('new')}
          >
            <Text style={[
              styles.tabText,
              selectedTab === 'new' && styles.activeTabText
            ]}>
              Create New
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.tabContent}>
          {selectedTab === 'existing' ? (
            <View style={styles.existingWishlistContent}>
              {wishlistLoading ? (
                <ActivityIndicator size="large" color="#00D09C" />
              ) : wishlists.length > 0 ? (
                <FlatList
                  data={wishlists}
                  renderItem={renderWishlistItem}
                  keyExtractor={(item) => item.id}
                  style={styles.wishlistList}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="heart-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyStateText}>No wishlists found</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Create your first wishlist to get started
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.newWishlistContent}>
              <Text style={styles.inputLabel}>Wishlist Name</Text>
              <TextInput
                style={styles.textInput}
                value={newWishlistName}
                onChangeText={setNewWishlistName}
                placeholder="Enter wishlist name..."
                placeholderTextColor="#999"
                maxLength={50}
                autoFocus
              />
              <Text style={styles.characterCount}>
                {newWishlistName.length}/50 characters
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.addButton,
              (loading || 
               (selectedTab === 'existing' && !selectedWishlistId) ||
               (selectedTab === 'new' && !newWishlistName.trim())
              ) && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={
              loading || 
              (selectedTab === 'existing' && !selectedWishlistId) ||
              (selectedTab === 'new' && !newWishlistName.trim())
            }
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.addButtonText}>
                {selectedTab === 'existing' ? 'Add to Wishlist' : 'Create & Add'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    height: 450,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stockIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00D09C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stockIconText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stockDetails: {
    flex: 1,
  },
  stockName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  stockSymbol: {
    fontSize: 14,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#00D09C',
  },
  disabledTab: {
    opacity: 0.5,
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#00D09C',
    fontWeight: '600',
  },
  disabledTabText: {
    color: '#ccc',
  },
  tabContent: {
    height: 240,
    marginBottom: 80,
  },
  existingWishlistContent: {
    height: '100%',
  },
  wishlistList: {
    height: 200,
  },
  wishlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  selectedWishlistItem: {
    borderColor: '#00D09C',
    backgroundColor: '#f0f9f7',
  },
  wishlistItemContent: {
    flex: 1,
  },
  wishlistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  wishlistStockCount: {
    fontSize: 14,
    color: '#666',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#00D09C',
    backgroundColor: '#00D09C',
  },
  newWishlistContent: {
    paddingTop: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  addButton: {
    flex: 2,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#00D09C',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default WishlistModal;
