import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders();
  }, []);

  const getOrders = async () => {
    try {
      const userId = await AsyncStorage.getItem('USERID');
      console.log('📦 USERID từ AsyncStorage:', JSON.stringify(userId));

      if (!userId) {
        setOrders([]);
        return;
      }

      const snapshot = await firestore()
        .collection('orders')
        .where('userId', '==', userId)
        // ⚠️ Nếu không chắc createdAt là Timestamp thì hãy bỏ comment dòng dưới
        // .orderBy('createdAt', 'desc')
        .get();

      console.log('📥 Số đơn hàng lấy được:', snapshot.size);

      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d
        };
      });

      console.log('🧾 Danh sách đơn:', data);
      setOrders(data);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="red" />
        <Text style={{ marginTop: 10 }}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh sách đơn hàng của bạn</Text>

      {orders.length === 0 ? (
        <Text style={styles.noOrdersText}>Bạn chưa có đơn hàng nào.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.label}>🆔 Mã đơn: <Text style={styles.value}>{item.id}</Text></Text>

              <Text style={styles.label}>🕒 Thời gian đặt:</Text>
              <Text style={styles.value}>{formatDate(item.createdAt)}</Text>

              <Text style={styles.label}>🍽️ Món:</Text>
              <Text style={styles.value}>
                {item.cartList?.map(i => i.name).join(', ') || 'Không có món'}
              </Text>


              <Text style={styles.label}>💵 Tổng tiền:</Text>
              <Text style={[styles.value, { color: '#C62828', fontWeight: 'bold' }]}>
                {item.total?.toLocaleString('vi-VN')} đ
              </Text>

              <Text style={styles.label}>📍 Địa chỉ nhận:</Text>
              <Text style={styles.value}>{item.address}</Text>

              <Text style={styles.label}>📞 Số điện thoại:</Text>
              <Text style={styles.value}>{item.userMobile}</Text>

              <Text style={styles.label}>📦 Trạng thái:</Text>
              <Text style={[styles.value, {
                color: item.status === 'success' ? 'green' : 'orange',
                fontWeight: '600'
              }]}>
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
