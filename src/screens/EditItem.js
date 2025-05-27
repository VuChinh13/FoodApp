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
import { useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const EditItem = ({ navigation }) => {
  const route = useRoute();

  const [imageData, setImageData] = useState({
    assets: [{ uri: route.params.data.imageUrl }],
  });
  const [name, setName] = useState(route.params.data.name);
  const [rating, setRating] = useState(route.params.data.rating?.toString() || '');
  const [price, setPrice] = useState(route.params.data.price);
  const [discountPrice, setDiscountPrice] = useState(route.params.data.discountPrice);
  const [description, setDescription] = useState(route.params.data.description);
  const [vendor, setVendor] = useState(route.params.data.vendor || '');
  const [category, setCategory] = useState(route.params.data.category || '');

  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Quyền truy cập Camera',
            message: 'Ứng dụng cần quyền truy cập camera để chọn ảnh.',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Hủy',
            buttonPositive: 'Đồng ý',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          openGallery();
        } else {
          Alert.alert('Thông báo', 'Bạn cần cấp quyền truy cập camera.');
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
      const result = await launchImageLibrary({ mediaType: 'photo' });
      if (result.didCancel) {
        return;
      }
      if (result.errorCode) {
        Alert.alert('Lỗi', 'Không thể mở thư viện ảnh: ' + result.errorMessage);
        return;
      }
      if (result.assets && result.assets.length > 0) {
        setImageData(result);
      } else {
        Alert.alert('Lỗi', 'Không có ảnh được chọn.');
      }
    } catch (error) {
      console.error('Lỗi khi mở thư viện ảnh:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi chọn ảnh.');
    }
  };

  const uploadImageToCloudinary = async () => {
    if (!imageData) return null;

    const file = {
      uri: imageData.assets[0].uri,
      type: imageData.assets[0].type || 'image/jpeg',
      name: imageData.assets[0].fileName || 'upload.jpg',
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

  const uploadItem = async (uploadedImageUrl) => {
    try {
      await firestore()
        .collection('items')
        .doc(route.params.id)
        .update({
          name: name,
          price: parseFloat(price),
          discountPrice: parseFloat(discountPrice),
          description: description,
          imageUrl: uploadedImageUrl,
          category: category,
          vendor: vendor,
          rating: parseFloat(rating) || 0,
        });
      Alert.alert('Thành công', 'Cập nhật món ăn thành công!');
      navigation.goBack();
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      Alert.alert('Lỗi', 'Cập nhật món ăn thất bại.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Chỉnh sửa món ăn</Text>
        </View>

        {imageData?.assets?.length > 0 && (
          <Image
            source={{ uri: imageData.assets[0].uri }}
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
          value={price?.toString()}
          keyboardType="numeric"
          onChangeText={setPrice}
        />
        <TextInput
          placeholder="Nhập giá giảm (nếu có)"
          style={styles.inputStyle}
          value={discountPrice?.toString()}
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
          placeholder="Nhà cung cấp"
          style={styles.inputStyle}
          value={vendor}
          onChangeText={setVendor}
        />
        <TextInput
          placeholder="Điểm đánh giá (0 - 5)"
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
            <Picker.Item label="Đồ uống" value="Đồ uống" />
            <Picker.Item label="Combo" value="Combo" />
            <Picker.Item label="Bánh mì kẹp" value="Bánh mì kẹp" />
            <Picker.Item label="Kinh điển" value="Kinh điển" />
          </Picker>
        </View>

        <TouchableOpacity
          style={styles.pickBtn}
          onPress={requestCameraPermission}
        >
          <Text>Chọn ảnh từ thư viện</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={async () => {
            let finalImageUrl = route.params.data.imageUrl;

            if (
              imageData?.assets?.length > 0 &&
              imageData.assets[0].uri !== route.params.data.imageUrl
            ) {
              const url = await uploadImageToCloudinary();
              if (url) {
                finalImageUrl = url;
              } else {
                Alert.alert('Lỗi', 'Tải ảnh lên thất bại.');
                return;
              }
            }

            uploadItem(finalImageUrl);
          }}
        >
          <Text style={{ color: '#fff' }}>Cập nhật món ăn</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginTop: 30,
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
