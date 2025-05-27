import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Toast from "react-native-toast-message";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const WishlistScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const fetchAllWishlistData = useCallback(async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('USERID');
      let fetchedWishlistIds = [];
      if (userId) {
        const userDoc = await firestore().collection('users').doc(userId).get();
        fetchedWishlistIds = userDoc.exists ? (userDoc.data()?.wishlist || []) : [];
        console.log('Fetched Wishlist IDs from Firestore:', fetchedWishlistIds);
      }

      if (fetchedWishlistIds.length > 0) {
        const itemsPromises = fetchedWishlistIds.map(async itemId => {
          try {
            const itemDoc = await firestore().collection('items').doc(itemId).get();
            if (itemDoc.exists) {
              return { id: itemDoc.id, ...itemDoc.data() };
            }
            return null;
          } catch (itemError) {
            console.error(`Error fetching item đ{itemId}:`, itemError);
            return null;
          }
        });
        const items = await Promise.all(itemsPromises);
        const validItems = items.filter(item => item !== null);
        setWishlistItems(validItems);
        console.log('Successfully fetched Wishlist Items:', validItems.length);
      } else {
        setWishlistItems([]);
        console.log('No wishlist IDs found, setting wishlistItems to empty.');
      }
    } catch (error) {
      console.error("Error in fetchAllWishlistData:", error);
      Alert.alert('Lỗi', 'Không thể tải danh sách yêu thích. Vui lòng thử lại.');
      setWishlistItems([]);
    } finally {
      setLoading(false);
      console.log('Loading finished.');
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      console.log('WishlistScreen is focused, fetching data...');
      fetchAllWishlistData();
    }
  }, [isFocused, fetchAllWishlistData]);

  const removeFromWishlist = async itemId => {
    const userId = await AsyncStorage.getItem('USERID');
    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng đăng nhập để thực hiện thao tác này.',
      });
      return;
    }

    const currentWishlistIds = wishlistItems.map(item => item.id);
    const updatedWishlistIds = currentWishlistIds.filter(id => id !== itemId);
    const updatedWishlistItemsLocal = wishlistItems.filter(item => item.id !== itemId);

    setWishlistItems(updatedWishlistItemsLocal);

    try {
      const userRef = firestore().collection('users').doc(userId);
      await userRef.update({ wishlist: updatedWishlistIds });
      console.log('Updated Wishlist in Firestore:', updatedWishlistIds);

      Toast.show({
        type: 'success',
        text1: 'Thành công!',
        text2: 'Đã xóa món ăn khỏi danh sách yêu thích.',
        position: 'top',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
      });
    } catch (error) {
      console.error("Error updating wishlist in Firestore:", error);
      Alert.alert('Lỗi', 'Không thể xóa món ăn khỏi danh sách yêu thích. Vui lòng thử lại.');
      fetchAllWishlistData();
    }
  };

  const handleAddToCart = (item) => {
    console.log('Thêm vào giỏ hàng:', item.name);
    Toast.show({
      type: 'info',
      text1: 'Thông báo',
      text2: `đ{item.name} đã được thêm vào giỏ hàng.`,
      position: 'top',
      visibilityTime: 2000,
      autoHide: true,
      topOffset: 30,
    });
  };

  const filteredWishlistItems = wishlistItems.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.subtitle?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.vendor?.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const displayPrice = (item.discountPrice !== null && item.discountPrice !== undefined && item.discountPrice > 0)
      ? item.discountPrice
      : (item.price !== null && item.price !== undefined ? item.price : 0);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Detail', { item })}>
        <Image source={{ uri: item.imageUrl || item.image || 'https://via.placeholder.com/150' }} style={styles.image} />
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle || item.vendor || 'N/A'}</Text>

        <Text style={styles.price}>
          {displayPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
        </Text>

        <View style={styles.ratingRow}>
          <Text style={styles.rating}>⭐ {item.rating?.toFixed(1) ?? 0}</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => removeFromWishlist(item.id)}
            style={styles.iconContainer}>
            <Text style={[styles.heart, { color: '#C62828' }]}>{'\u2665'}</Text>
          </TouchableOpacity>
        </View>

        {item.inStock && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleAddToCart(item)}
            style={styles.addToCartButton}>
            <Text style={styles.addToCartButtonText}>Thêm vào giỏ</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm món ăn yêu thích..."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
          clearButtonMode="while-editing"
        />
      </View>

      {loading ? (
        <View style={styles.centeredView}>
          <ActivityIndicator size="large" color="#8E1C1C" />
          <Text style={styles.loadingText}>Đang tải danh sách yêu thích...</Text>
        </View>
      ) : filteredWishlistItems.length === 0 ? (
        <Text style={styles.emptyText}>
          {searchText ? 'Không tìm thấy món ăn nào phù hợp.' : 'Chưa có món ăn nào trong danh sách yêu thích của bạn!'}
        </Text>
      ) : (
        <FlatList
          numColumns={2}
          data={filteredWishlistItems}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default WishlistScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 40,
    backgroundColor: '#f9f9f9',
    paddingTop: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E1C1C',
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#8E1C1C',
    paddingHorizontal: 20,
  },

  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDECEA',
    borderRadius: 25,
    marginHorizontal: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#4A0000',
    paddingVertical: 0,
  },
  clearSearchButton: {
    marginLeft: 10,
    padding: 5,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginHorizontal: 10,
  },
  contentContainer: {
    paddingBottom: 20,
  },

  card: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    elevation: 2,
    width: '46%',
    marginBottom: 15,
    padding: 10,
    shadowColor: '#C62828',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    // borderWidth: 1, 
    // borderColor: '#eee', 
    marginHorizontal: '1%',
  },
  image: {
    height: 120,
    borderRadius: 10,
    resizeMode: 'cover',
    marginBottom: 10,
  },

  name: {
    fontWeight: '700',
    fontSize: 15,
    color: '#8E1C1C',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#9E3B3B',
    marginBottom: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#C62828',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  rating: {
    fontSize: 18,
    color: '#8E1C1C',
    alignSelf: 'center',
  },
  iconContainer: {
    padding: 5,
  },
  heart: {
    fontSize: 18,
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  addToCartButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  removeWishlistButton: {
    padding: 5,
    borderRadius: 50,
  },
});
