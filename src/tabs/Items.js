import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useIsFocused, useNavigation } from '@react-navigation/native';

const Items = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    getItems();
  }, [isFocused]);

  const getItems = () => {
    firestore()
      .collection('items')
      .get()
      .then(querySnapshot => {
        let tempData = [];
        querySnapshot.forEach(documentSnapshot => {
          tempData.push({
            id: documentSnapshot.id,
            data: documentSnapshot.data(),
          });
        });
        setItems(tempData);
      });
  };

  const deleteItem = docId => {
    firestore()
      .collection('items')
      .doc(docId)
      .delete()
      .then(() => {
        getItems();
      });
  };

  // Lọc items theo searchText, không phân biệt hoa thường
  const filteredItems = items.filter(item =>
    item.data.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      {/* Thanh tìm kiếm */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search food items..."
        value={searchText}
        onChangeText={setSearchText}
        clearButtonMode="while-editing" // iOS có nút clear
      />

      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          return (
            <View style={styles.itemView}>
              <Image
                source={{ uri: item.data.imageUrl }}
                style={styles.itemImage}
              />
              <View style={styles.nameView}>
                <Text style={styles.nameText}>{item.data.name}</Text>

                {/* Hiển thị rating */}
                <View style={styles.ratingView}>
                  <Text style={styles.star}>⭐</Text>
                  <Text style={styles.ratingText}>
                    {item.data.rating ?? 0}
                  </Text>
                </View>

                <Text style={styles.descText}>{item.data.vendor}</Text>
                <View style={styles.priceView}>
                  <Text style={styles.priceText}>
                    {'$' + item.data.discountPrice}
                  </Text>
                  <Text style={styles.discountText}>
                    {'$' + item.data.price}
                  </Text>
                </View>
              </View>
              <View style={{ margin: 10, paddingRight: 15 }}>
                <TouchableOpacity
                  style={{ marginRight: 15 }}  // Thêm khoảng cách bên phải cho nút sửa
                  onPress={() => {
                    navigation.navigate('EditItem', {
                      data: item.data,
                      id: item.id,
                    });
                  }}>
                  <Image
                    source={require('../images/edit.png')}
                    style={styles.icon}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    deleteItem(item.id);
                  }}>
                  <Image
                    source={require('../images/delete.png')}
                    style={[styles.icon, { marginTop: 20 }]}
                  />
                </TouchableOpacity>
              </View>

            </View>
          );
        }}
      />
    </View>
  );
};

export default Items;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 70,
    flex: 1,
  },
  searchInput: {
    height: 45,
    margin: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 0.5,
    borderColor: '#ccc',
  },
  itemView: {
    flexDirection: 'row',
    width: '94%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    elevation: 4,
    marginTop: 8,
    borderRadius: 10,
    height: 120,
    marginBottom: 7,
  },
  itemImage: {
    marginTop: 15,
    width: 90,
    height: 90,
    borderRadius: 10,
    marginLeft: 15,
    marginRight: 5,
  },
  nameView: {
    width: '53%',
    margin: 10,
  },
  ratingView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  star: {
    fontSize: 16,
    marginRight: 5,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
  },
  descText: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceText: {
    fontSize: 18,
    color: 'green',
    fontWeight: '700',
  },
  discountText: {
    fontSize: 17,
    fontWeight: '600',
    textDecorationLine: 'line-through',
    marginLeft: 5,
  },
  icon: {
    width: 24,
    height: 24,
  },
});
