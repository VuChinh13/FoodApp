import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  PermissionsAndroid,
  Image,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const AddFoodItem = () => {
  const [imageData, setImageData] = useState(null);
  const [name, setName] = useState('');
  const [rating, setRating] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [vendor, setVendor] = useState('');

  const requestStoragePermission = async () => {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {  // Android 13+
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: 'Quyền truy cập ảnh',
              message: 'Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh.',
              buttonNeutral: 'Hỏi lại sau',
              buttonNegative: 'Hủy',
              buttonPositive: 'Đồng ý',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            openGallery();
          } else {
            Alert.alert('Thông báo', 'Bạn cần cấp quyền truy cập ảnh.');
          }
        } else { // Android < 13
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Quyền truy cập ảnh',
              message: 'Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh.',
              buttonNeutral: 'Hỏi lại sau',
              buttonNegative: 'Hủy',
              buttonPositive: 'Đồng ý',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            openGallery();
          } else {
            Alert.alert('Thông báo', 'Bạn cần cấp quyền truy cập ảnh.');
          }
        }
      } else {
        openGallery();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const openGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
        selectionLimit: 1,
      });

      if (result.didCancel) {
        console.log('Người dùng đã hủy chọn ảnh');
        return;
      }

      if (result.errorCode) {
        Alert.alert('Lỗi', 'Không thể mở thư viện ảnh: ' + result.errorMessage);
        return;
      }

      if (result.assets && result.assets.length > 0) {
        setImageData(result.assets[0]);
      } else {
        Alert.alert('Lỗi', 'Không có ảnh được chọn');
      }
    } catch (error) {
      console.error('Lỗi khi mở thư viện ảnh:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi chọn ảnh');
    }
  };

  const uploadImageToCloudinary = async () => {
    if (!imageData) return null;

    const file = {
      uri: imageData.uri,
      type: imageData.type || 'image/jpeg',
      name: imageData.fileName || 'upload.jpg',
    };

    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'upload_zxmimtwp');
    data.append('folder', 'admin_food');

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dsjsdyba7/image/upload', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      console.log('Phản hồi Cloudinary:', json);

      if (!res.ok || !json.secure_url) {
        return null;
      }

      return json.secure_url;
    } catch (error) {
      console.error('Lỗi upload ảnh Cloudinary:', error);
      return null;
    }
  };

  const uploadItem = async (imageUrl) => {
    try {
      await firestore().collection('items').add({
        name: name,
        price: parseFloat(price),
        discountPrice: parseFloat(discountPrice),
        description: description,
        imageUrl: imageUrl,
        category: category,
        vendor: vendor,
        rating: parseFloat(rating) || 0,
      });
      Alert.alert('Thành công', 'Đã thêm món ăn mới!');
      resetForm();
    } catch (error) {
      console.error('Lỗi Firestore:', error);
      Alert.alert('Lỗi', 'Lưu dữ liệu thất bại.');
    }
  };

  const handleSubmit = async () => {
    if (!name || !price || !category || !vendor || !imageData) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin và chọn ảnh.');
      return;
    }

    const imageUrl = await uploadImageToCloudinary();
    if (!imageUrl) {
      Alert.alert('Lỗi', 'Tải ảnh lên thất bại.');
      return;
    }

    uploadItem(imageUrl);
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setDiscountPrice('');
    setDescription('');
    setCategory('');
    setVendor('');
    setRating('');
    setImageData(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Thêm món ăn mới</Text>
        </View>

        {imageData && (
          <Image
            source={{ uri: imageData.uri }}
            style={styles.imageStyle}
          />
        )}

        <TextInput
          placeholder="Nhập tên món ăn"
          style={styles.inputStyle}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Nhập giá món ăn"
          style={styles.inputStyle}
          value={price}
          keyboardType="numeric"
          onChangeText={setPrice}
        />
        <TextInput
          placeholder="Nhập giá món (sau khi giảm)"
          style={styles.inputStyle}
          value={discountPrice}
          keyboardType="numeric"
          onChangeText={setDiscountPrice}
        />
        <TextInput
          placeholder="Mô tả món ăn"
          style={[styles.inputStyle, { height: 100, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          multiline={true}
          numberOfLines={4}
        />
        <TextInput
          placeholder="Nhập nhà cung cấp"
          style={styles.inputStyle}
          value={vendor}
          onChangeText={setVendor}
        />
        <TextInput
          placeholder="Nhập điểm đánh giá ban đầu (0 - 5)"
          style={styles.inputStyle}
          value={rating}
          keyboardType="numeric"
          onChangeText={setRating}
        />

        <View style={[styles.inputStyle, { padding: 0, justifyContent: 'center' }]}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            mode="dropdown"
            style={{ width: '100%' }}
          >
            <Picker.Item label="Chọn danh mục" value="" />
            <Picker.Item label="Combo" value="Combo" />
            <Picker.Item label="Bánh mì kẹp" value="Bánh mì kẹp" />
            <Picker.Item label="Kinh điển" value="Kinh điển" />
            <Picker.Item label="Đồ uống" value="Đồ uống" />
          </Picker>

        </View>

        <TouchableOpacity
          style={styles.pickBtn}
          onPress={requestStoragePermission}
        >
          <Text>Chọn ảnh từ thư viện</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadBtn} onPress={handleSubmit}>
          <Text style={{ color: '#fff' }}>Tải lên món ăn</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AddFoodItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 60,
    width: '100%',
    backgroundColor: '#fff',
    elevation: 5,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
  },
  inputStyle: {
    width: '90%',
    height: 50,
    borderRadius: 10,
    borderWidth: 0.5,
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#fff',
    fontSize: 16,
  },
  pickBtn: {
    width: '90%',
    height: 50,
    borderWidth: 0.5,
    borderRadius: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#fff',
  },
  uploadBtn: {
    backgroundColor: '#5246f2',
    width: '90%',
    height: 50,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 70,
  },
  imageStyle: {
    width: '90%',
    height: 200,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
  },
});
