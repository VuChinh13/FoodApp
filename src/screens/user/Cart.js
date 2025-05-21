import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

let userId = '';

const Cart = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [cartList, setCartList] = useState([]);

  useEffect(() => {
    getCartItems();
  }, [isFocused]);

  const getCartItems = async () => {
    userId = await AsyncStorage.getItem('USERID');
    const user = await firestore().collection('users').doc(userId).get();
    setCartList(user._data.cart);
  };

  const addItem = async item => {
    const user = await firestore().collection('users').doc(userId).get();
    let tempDart = user._data.cart.map(itm => {
      if (itm.id === item.id) {
        return {
          ...itm,
          data: {
            ...itm.data,
            qty: Number(itm.data.qty) + 1,
          },
        };
      }
      return itm;
    });

    await firestore().collection('users').doc(userId).update({ cart: tempDart });
    getCartItems();
  };

  const removeItem = async item => {
    const user = await firestore().collection('users').doc(userId).get();
    let tempDart = user._data.cart.map(itm => {
      if (itm.id === item.id) {
        let updatedQty = Number(itm.data.qty) - 1;
        if (updatedQty <= 0) {
          return null; // đánh dấu để filter sau
        } else {
          return {
            ...itm,
            data: {
              ...itm.data,
              qty: updatedQty,
            },
          };
        }
      }
      return itm;
    }).filter(Boolean);

    await firestore().collection('users').doc(userId).update({ cart: tempDart });
    getCartItems();
  };

  const getTotal = () => {
    return cartList.reduce((total, item) => {
      const qty = Number(item.data.qty || 0);
      const price = Number(item.data.discountPrice || 0);
      return total + qty * price;
    }, 0).toFixed(2);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cartList}
        renderItem={({ item }) => (
          <View style={styles.itemView}>
            <Image source={{ uri: item.data.imageUrl }} style={styles.itemImage} />
            <View style={styles.middleView}>
              <Text style={styles.nameText}>{item.data.name}</Text>
              <Text style={styles.descText}>{item.data.vendor}</Text>
              <View style={styles.priceView}>
                <Text style={styles.priceText}>${item.data.discountPrice}</Text>
                <Text style={styles.discountText}>${item.data.price}</Text>
              </View>
            </View>
            <View style={styles.addRemoveView}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => item.data.qty > 1 ? removeItem(item) : null}>
                <Text style={styles.qtyText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyCount}>{item.data.qty}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => addItem(item)}>
                <Text style={styles.qtyText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(_, index) => index.toString()}
      />
      {cartList.length > 0 && (
        <View style={styles.checkoutView}>
          <Text style={{ color: '#000', fontWeight: '600' }}>
            Items({cartList.length}){"\n"}Total: ${getTotal()}
          </Text>
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() => navigation.navigate('Checkout')}>
            <Text style={{ color: '#fff' }}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Cart;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  itemView: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  middleView: {
    flex: 1,
    paddingHorizontal: 10,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
  },
  descText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#777',
  },
  priceView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  priceText: {
    fontSize: 16,
    color: 'green',
    fontWeight: '700',
  },
  discountText: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginLeft: 8,
    color: '#888',
  },
  addRemoveView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    backgroundColor: 'green',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  qtyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyCount: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  checkoutView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 60,
    backgroundColor: '#fff',
    borderTopColor: '#eee',
    borderTopWidth: 1,
  },
  checkoutBtn: {
    backgroundColor: 'green',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
