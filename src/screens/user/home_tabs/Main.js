import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Toast from "react-native-toast-message";

const categories = ['Tất cả', 'Combo', 'Bánh mì kẹp', 'Kinh điển', 'Đồ uống'];

const Main = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Thêm state loading

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true); // ✅ Bắt đầu loading
        const querySnapshot = await firestore().collection('items').get();
        const data = [];
        querySnapshot.forEach(doc => {
          data.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setItems(data);
      } catch (error) {
        console.log('Lỗi khi lấy món ăn: ', error);
      } finally {
        setLoading(false); // ✅ Kết thúc loading
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    let filtered = items;
    if (selectedCategory !== 'Tất cả') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    if (searchText.trim() !== '') {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(lowerSearch),
      );
    }
    setFilteredItems(filtered);
  }, [selectedCategory, items, searchText]);

  useEffect(() => {
    getCartItems();
    getWishlist();
  }, [isFocused]);

  const getCartItems = async () => {
    const userId = await AsyncStorage.getItem('USERID');
    if (userId) {
      const user = await firestore().collection('users').doc(userId).get();
      const cartData = user._data?.cart;
      setCartCount(Array.isArray(cartData) ? cartData.length : 0);
    }
  };

  const getWishlist = async () => {
    const userId = await AsyncStorage.getItem('USERID');
    if (userId) {
      const user = await firestore().collection('users').doc(userId).get();
      const wish = user._data?.wishlist || [];
      setWishlist(Array.isArray(wish) ? wish : []);
    } else {
      setWishlist([]);
    }
  };

  const toggleWishlist = async itemId => {
    const userId = await AsyncStorage.getItem('USERID');
    if (userId) {
      const userRef = firestore().collection('users').doc(userId);

      const isWished = wishlist.includes(itemId);
      const updatedWishlist = isWished
        ? wishlist.filter(id => id !== itemId)
        : [...wishlist, itemId];

      setWishlist(updatedWishlist);
      await userRef.update({ wishlist: updatedWishlist });

      if (!isWished) {
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Đã thêm món ăn vào mục yêu thích.',
          position: 'top',
          visibilityTime: 2000,
          autoHide: true,
          topOffset: 30,
        });
      } else {
        Toast.show({
          type: 'info',
          text1: 'Thông báo',
          text2: 'Đã xóa món ăn khỏi mục yêu thích.',
          position: 'top',
          visibilityTime: 2000,
          autoHide: true,
          topOffset: 30,
        });
      }
    }
  };

  const renderCategory = () => (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={categories}
      keyExtractor={item => item}
      contentContainerStyle={{ paddingHorizontal: 10 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.categoryButton,
            {
              backgroundColor:
                item === selectedCategory ? '#C62828' : '#F9EBEA',
            },
          ]}
          onPress={() => setSelectedCategory(item)}>
          <Text
            style={{
              color: item === selectedCategory ? '#fff' : '#C62828',
              fontWeight: '600',
            }}>
            {item}
          </Text>
        </TouchableOpacity>
      )}
    />
  );

  const renderItem = ({ item }) => {
    const isWished = wishlist.includes(item.id);
    const displayPrice = (item.discountPrice !== null && item.discountPrice !== undefined && item.discountPrice > 0)
      ? item.discountPrice
      : (item.price !== null && item.price !== undefined ? item.price : 0);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Detail', { item })}>
        <Image source={{ uri: item.imageUrl || item.image }} style={styles.image} />
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle || item.vendor || ''}</Text>
        <Text style={styles.price}>
          {displayPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
        </Text>

        <View style={styles.ratingRow}>
          <Text style={styles.rating}>⭐ {item.rating?.toFixed(1) ?? 0}</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => toggleWishlist(item.id)}
            style={styles.iconContainer}>
            <Text
              style={[
                styles.heart,
                { color: isWished ? '#C62828' : '#A0A0A0' },
              ]}>
              {'\u2665'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logoText}>FoodApp</Text>
          <Text style={styles.subText}>Đặt món ăn yêu thích của bạn!</Text>
        </View>
        <TouchableOpacity
          style={styles.cartIcon}
          onPress={() => navigation.navigate('Cart')}>
          <Image
            source={require('../../../images/cart.png')}
            style={{ width: 28, height: 28 }}
          />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm món ăn....."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.categoryContainer}>{renderCategory()}</View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C62828" />
          <Text style={{ marginTop: 10, color: '#C62828' }}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <FlatList
          numColumns={2}
          data={filteredItems}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 10 }}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default Main;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 40,
    backgroundColor: '#fff',
    paddingTop: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#C62828',
  },
  subText: {
    color: '#8E1C1C',
    fontSize: 14,
    marginTop: 2,
  },
  cartIcon: {
    backgroundColor: '#F9EBEA',
    padding: 8,
    borderRadius: 30,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    marginHorizontal: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    height: 45,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  categoryContainer: {
    marginBottom: 10,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
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
    marginHorizontal: '1%',
  },
  image: {
    height: 100,
    borderRadius: 10,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  name: {
    fontWeight: '700',
    fontSize: 16,
    color: '#8E1C1C',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
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
  },
  iconContainer: {
    padding: 5,
  },
  heart: {
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
});
