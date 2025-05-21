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
import ImageResizer from 'react-native-image-resizer';
import firestore from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const Add = () => {
  const [imageData, setImageData] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [vendor, setVendor] = useState('');  // thêm state vendor

  // ... các hàm requestCameraPermission, openGallery, uploadImage giữ nguyên

  const uploadImage = async () => {
    if (category === '') {
      Alert.alert('Validation', 'Please select a category.');
      return;
    }

    if (vendor.trim() === '') {
      Alert.alert('Validation', 'Please enter vendor.');
      return;
    }

    if (imageUrl.trim() !== '') {
      uploadItem(imageUrl.trim());
      return;
    }

    if (!imageData || !imageData.uri) {
      Alert.alert('Notice', 'Please select an image or enter an image URL.');
      return;
    }

    // ... phần upload ảnh lên Cloudinary giữ nguyên
  };

  const uploadItem = (url) => {
    firestore()
      .collection('items')
      .add({
        name: name,
        price: parseFloat(price),
        discountPrice: parseFloat(discountPrice),
        description: description,
        imageUrl: url,
        category: category,
        rating: 0,
        vendor: vendor,  // lưu vendor vào firestore
      })
      .then(() => {
        Alert.alert('Success', 'Item added successfully!');
        resetForm();
      })
      .catch(error => {
        console.error('Firestore Error:', error);
        Alert.alert('Error', 'Failed to save data.');
      });
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setDiscountPrice('');
    setDescription('');
    setImageUrl('');
    setImageData(null);
    setCategory('');
    setVendor(''); // reset vendor
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Add Food Item</Text>
        </View>

        {imageData !== null ? (
          <Image source={{ uri: imageData.uri }} style={styles.imageStyle} />
        ) : null}

        <TextInput
          placeholder="Food Name"
          style={styles.inputStyle}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Price"
          style={styles.inputStyle}
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />
        <TextInput
          placeholder="Discount Price (optional)"
          style={styles.inputStyle}
          keyboardType="numeric"
          value={discountPrice}
          onChangeText={setDiscountPrice}
        />
        <TextInput
          placeholder="Description"
          style={[styles.inputStyle, { height: 100, textAlignVertical: 'top' }]} // tăng chiều cao để nhập nhiều dòng
          value={description}
          onChangeText={setDescription}
          multiline={true}
          numberOfLines={4}
        />

        <TextInput
          placeholder="Vendor"
          style={styles.inputStyle}
          value={vendor}
          onChangeText={setVendor}
        />
        <TextInput
          placeholder="Image URL (optional)"
          style={styles.inputStyle}
          value={imageUrl}
          onChangeText={setImageUrl}
        />

        <View style={[styles.inputStyle, { padding: 0, justifyContent: 'center' }]}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            mode="dropdown"
            style={{ width: '100%' }}>
            <Picker.Item label="Select Category" value="" />
            <Picker.Item label="Drinks" value="Drinks" />
            <Picker.Item label="Combos" value="Combos" />
            <Picker.Item label="Sliders" value="Sliders" />
            <Picker.Item label="Classic" value="Classic" />
          </Picker>
        </View>

        <Text style={{ alignSelf: 'center', marginTop: 20 }}>OR</Text>

        <TouchableOpacity
          style={styles.pickBtn}
          onPress={() => requestCameraPermission()}>
          <Text>Select Image from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadBtn} onPress={uploadImage}>
          <Text style={{ color: '#fff' }}>Upload Item</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Add;

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
    fontSize: 16,
    height: 50,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#ccc',
    paddingLeft: 20,
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#fff',
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
