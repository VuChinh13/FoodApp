import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  // Hàm lấy dữ liệu người dùng từ Firestore
  const getUserData = async () => {
    setLoading(true);
    const userId = await AsyncStorage.getItem('USERID');
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const userDoc = await firestore().collection('users').doc(userId).get();
      if (userDoc.exists) {
        setUserData(userDoc.data());
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy dữ liệu người dùng.');
        setUserData(null);
      }
    } catch (error) {
      console.error('Lỗi lấy dữ liệu người dùng:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu người dùng.');
    } finally {
      setLoading(false);
    }
  };

  // Tự động gọi getUserData khi màn hình được focus
  useEffect(() => {
    if (isFocused) {
      getUserData();
    }
  }, [isFocused]);

  // Hàm chọn ảnh từ thư viện
  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo' });
      if (result.didCancel || !result.assets || result.assets.length === 0) return;

      const image = result.assets[0];
      if (!image.uri) return;

      uploadImage(image.uri);
    } catch (error) {
      console.error('Lỗi chọn ảnh:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh.');
    }
  };

  // Upload ảnh lên Firebase Storage và cập nhật URL lên Firestore
  // ...

const uploadImageToCloudinary = async (uri) => {
  const file = {
    uri: uri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  };

  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset', 'upload_zxmimtwp'); // Thay bằng preset của bạn
  data.append('folder', 'profile_images');

  try {
    const res = await fetch('https://api.cloudinary.com/v1_1/dsjsdyba7/image/upload', {
      method: 'POST',
      body: data,
    });

    const json = await res.json();
    if (!res.ok || !json.secure_url) {
      return null;
    }
    return json.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
};

const uploadImage = async (uri) => {
  setLoading(true);
  try {
    const userId = await AsyncStorage.getItem('USERID');
    if (!userId) throw new Error('Không tìm thấy UserID');

    const imageUrl = await uploadImageToCloudinary(uri);
    if (!imageUrl) {
      Alert.alert('Lỗi', 'Không thể tải ảnh lên Cloudinary.');
      setLoading(false);
      return;
    }

    // Cập nhật URL avatar trong Firestore
    await firestore().collection('users').doc(userId).update({
      avatar: imageUrl,
    });

    setUserData(prev => ({ ...prev, avatar: imageUrl }));

    Alert.alert('Thành công', 'Cập nhật ảnh đại diện thành công!');
  } catch (error) {
    console.error('Lỗi khi tải ảnh lên:', error);
    Alert.alert('Lỗi', 'Không thể cập nhật ảnh đại diện.');
  } finally {
    setLoading(false);
  }
};

  // Xử lý đăng xuất
  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['EMAIL', 'ROLE', 'USERID', 'MOBILE', 'NAME']);
          navigation.replace('Splash');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePickImage} activeOpacity={0.7}>
        <Image
          source={
            userData?.avatar
              ? { uri: userData.avatar }
              : require('../../../images/profile.png') // avatar mặc định nếu chưa có
          }
          style={styles.avatar}
        />
        <Text style={styles.editPhoto}>Sửa ảnh</Text>
      </TouchableOpacity>

      <Text style={styles.name}>{userData?.name || 'Chưa cập nhật tên'}</Text>
      <Text style={styles.info}>Email: {userData?.email || 'Chưa cập nhật'}</Text>
      <Text style={styles.info}>SĐT: {userData?.mobile || 'Chưa cập nhật'}</Text>

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => navigation.navigate('EditProfile', { userData })}
      >
        <Text style={styles.editText}>Sửa thông tin</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#eee',
  },
  editPhoto: {
    textAlign: 'center',
    color: '#1976D2',
    marginTop: 8,
    fontSize: 16,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    marginVertical: 20,
  },
  info: {
    fontSize: 16,
    marginVertical: 4,
  },
  editBtn: {
    marginTop: 20,
    backgroundColor: '#0288D1',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  editText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutBtn: {
    marginTop: 30,
    backgroundColor: '#D32F2F',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
