import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const categories = ['All', 'Combos', 'Sliders', 'Classic', 'Drinks'];

const Main = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
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
        console.log('Error fetching items: ', error);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    let filtered = items;
    if (selectedCategory !== 'All') {
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
    const user = await firestore().collection('users').doc(userId).get();
    const cartData = user._data?.cart;
    setCartCount(Array.isArray(cartData) ? cartData.length : 0);
  };

  const getWishlist = async () => {
    const userId = await AsyncStorage.getItem('USERID');
    const user = await firestore().collection('users').doc(userId).get();
    const wish = user._data?.wishlist;
    setWishlist(Array.isArray(wish) ? wish : []);
  };

  const toggleWishlist = async itemId => {
    const userId = await AsyncStorage.getItem('USERID');
    const userRef = firestore().collection('users').doc(userId);

    const isWished = wishlist.includes(itemId);
    const updatedWishlist = isWished
      ? wishlist.filter(id => id !== itemId)
      : [...wishlist, itemId];

    setWishlist(updatedWishlist);

    await userRef.update({ wishlist: updatedWishlist });
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

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Detail', { item })}>
        <Image source={{ uri: item.imageUrl || item.image }} style={styles.image} />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.subtitle}>{item.subtitle || item.vendor || ''}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>⭐ {item.rating ?? 0}</Text>
          <TouchableOpacity onPress={() => toggleWishlist(item.id)}>
            <Text style={[styles.heart, { color: isWished ? 'red' : 'black' }]}>
              ❤️
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
          <Text style={styles.subText}>Order your favourite food!</Text>
        </View>
        <TouchableOpacity
          style={styles.cartIcon}
          onPress={() => navigation.navigate('Cart')}>
          <Image
            source={require('../../../images/cart.png')}
            style={{ width: 28, height: 28 }}
          />
          {cartCount > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                backgroundColor: 'red',
                borderRadius: 10,
                paddingHorizontal: 5,
                paddingVertical: 1,
              }}>
              <Text style={{ color: 'white', fontSize: 12 }}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search"
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.categoryContainer}>{renderCategory()}</View>

      <FlatList
        numColumns={2}
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      />
    </View>
  );
};

export default Main;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginBottom: 60,
    paddingTop: 20,
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
  searchContainer: {
    flexDirection: 'row',
    marginHorizontal: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#FDECEA',
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#4A0000',
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
    width: '48%',
    marginBottom: 15,
    padding: 10,
    shadowColor: '#C62828',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    height: 100,
    borderRadius: 10,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  name: {
    fontWeight: '700',
    fontSize: 16,
    color: '#8E1C1C',
  },
  subtitle: {
    fontSize: 13,
    color: '#9E3B3B',
    marginBottom: 5,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#8E1C1C',
  },
  heart: {
    fontSize: 18,
  },
});
