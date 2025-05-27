import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';

const EditProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Khởi tạo state
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  // Lấy dữ liệu mới nhất khi màn hình mở
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('USERID');
        if (!userId) throw new Error('Không tìm thấy UserID');

        const doc = await firestore().collection('users').doc(userId).get();
        if (doc.exists) {
          const data = doc.data();
          setName(data.name || '');
          setMobile(data.mobile || '');
          setEmail(data.email || '');
          setPassword('');
          setConfirmPassword('');
        }
      } catch (error) {
        Alert.alert('Lỗi', error.message);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    const isNameChanged = name.trim() !== '' && name.trim() !== undefined;
    const isMobileChanged = mobile.trim() !== '' && mobile.trim() !== undefined;
    const isPasswordChanged = password.trim().length > 0;

    // Kiểm tra có thay đổi không (so với dữ liệu mới load)
    if (
      !isPasswordChanged &&
      name.trim() === '' &&
      mobile.trim() === ''
    ) {
      Alert.alert('Thông báo', 'Bạn chưa thay đổi gì.');
      return;
    }

    // Kiểm tra mật khẩu mới
    if (isPasswordChanged) {
      if (password.trim().length < 6) {
        Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
        return;
      }
    }

    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn cập nhật thông tin?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Cập nhật',
          onPress: async () => {
            setLoading(true);
            try {
              const userId = await AsyncStorage.getItem('USERID');
              if (!userId) throw new Error('Không tìm thấy UserID');

              const updateData = {
                name: name.trim(),
                mobile: mobile.trim(),
              };

              if (isPasswordChanged) {
                updateData.password = password.trim();
              }

              await firestore().collection('users').doc(userId).update(updateData);

              Alert.alert('Thành công', 'Cập nhật thông tin thành công');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Lỗi', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#fff' }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Email (không thể thay đổi)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: '#eee' }]}
          value={email}
          editable={false}
        />

        <Text style={styles.label}>Tên</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nhập tên của bạn"
        />

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
          placeholder="Nhập số điện thoại"
        />

        <Text style={styles.label}>Mật khẩu mới</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu mới"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>Xác nhận mật khẩu</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập lại mật khẩu mới"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, loading && { backgroundColor: '#999' }]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Đang lưu...' : 'Lưu thông tin'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 40,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 8,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E53935', // đỏ
  },
  saveButton: {
    backgroundColor: '#0288D1', // xanh
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
