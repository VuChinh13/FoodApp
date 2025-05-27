import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused, useNavigation } from '@react-navigation/native';

const Items = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true); // thêm state loading

  useEffect(() => {
    getItems();
  }, [isFocused]);

  const getItems = () => {
    setLoading(true); // bật loading khi bắt đầu tải
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
      })
      .catch(error => {
        console.error('Lỗi khi lấy items:', error);
      })
      .finally(() => {
        setLoading(false); // tắt loading khi xong
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

  const filteredItems = items.filter(item =>
    item.data.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          onPress: async () => {
            await AsyncStorage.removeItem('EMAIL');
            await AsyncStorage.removeItem('ROLE');
            navigation.replace('Splash');
          },
          style: 'destructive',
        },
      ],
      { cancelable: true },
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={{ marginTop: 10, fontSize: 16, color: '#555' }}>
          Đang tải danh sách món ăn...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Thanh tìm kiếm và nút đăng xuất cùng dòng */}
      <View style={styles.topBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm món ăn..."
          value={searchText}
          onChangeText={setSearchText}
          clearButtonMode="while-editing"
        />
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemView}>
            <Image source={{ uri: item.data.imageUrl }} style={styles.itemImage} />
            <View style={styles.nameView}>
              <Text style={styles.nameText}>{item.data.name}</Text>
              <View style={styles.ratingView}>
                <Text style={styles.star}>⭐</Text>
                <Text style={styles.ratingText}>{item.data.rating ?? 0}</Text>
              </View>
              <Text style={styles.descText}>{item.data.vendor}</Text>
              <View style={styles.priceView}>
                <Text style={styles.priceText}>{'đ' + item.data.discountPrice}</Text>
                <Text style={styles.discountText}>{'đ' + item.data.price}</Text>
              </View>
            </View>
            <View style={{ margin: 10, paddingRight: 15 }}>
              <TouchableOpacity
                style={{ marginRight: 15 }}
                onPress={() => {
                  navigation.navigate('EditItem', {
                    data: item.data,
                    id: item.id,
                  });
                }}>
                <Image source={require('../images/edit.png')} style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteItem(item.id)}>
                <Image
                  source={require('../images/delete.png')}
                  style={[styles.icon, { marginTop: 20 }]}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy món ăn nào.</Text>
          </View>
        }
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    marginHorizontal: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 0.5,
    borderColor: '#ccc',
  },
  logoutBtn: {
    marginLeft: 10,
    backgroundColor: '#ff6b6b',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    elevation: 3,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#555',
  },
});
