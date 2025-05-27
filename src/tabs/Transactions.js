import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    getOrders();
  }, []);

  const getOrders = async () => {
    try {
      const snapshot = await firestore()
        .collection('orders')
        .orderBy('createdAt', 'desc')
        .get();

      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
        };
      });

      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      console.log('❌ Lỗi khi truy vấn đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return '';
    const date = timestamp.toDate();
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order =>
        order.userName?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="red" />
        <Text style={{ marginTop: 10 }}>Đang tải danh sách đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách đơn hàng</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm theo người đặt"
        value={searchText}
        onChangeText={handleSearch}
      />

      {filteredOrders.length === 0 ? (
        <Text style={styles.noOrdersText}>Không tìm thấy đơn hàng phù hợp.</Text>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.label}>
                🆔 Mã đơn: <Text style={styles.value}>{item.id}</Text>
              </Text>

              <Text style={styles.label}>
                👤 Người đặt: <Text style={styles.value}>{item.userName || 'Không rõ'}</Text>
              </Text>

              <Text style={styles.label}>🍽️ Món:</Text>
              <Text style={styles.value}>
                {item.cartList?.map(i => i.name).join(', ') || 'Không có món'}
              </Text>

              <Text style={styles.label}>🕒 Thời gian đặt:</Text>
              <Text style={styles.value}>{formatDate(item.createdAt)}</Text>

              <Text style={styles.label}>💵 Tổng tiền:</Text>
              <Text style={[styles.value, { color: '#C62828', fontWeight: 'bold' }]}>
                {item.total?.toLocaleString('vi-VN')} đ
              </Text>

              <Text style={styles.label}>📦 Trạng thái:</Text>
              <Text
                style={[
                  styles.value,
                  {
                    color: item.status === 'success' ? 'green' : 'orange',
                    fontWeight: '600',
                  },
                ]}
              >
                {item.status === 'success' ? 'Thành công' : 'Đang xử lý'}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default Orders;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginBottom: 40,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#C62828',
    textAlign: 'center',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  noOrdersText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 30,
  },
  card: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    backgroundColor: '#fff',
    elevation: 4, // Android bóng
    shadowColor: '#000', // iOS bóng
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 6,
  },
  value: {
    fontSize: 15,
    color: '#000',
    marginLeft: 6,
  },
});
