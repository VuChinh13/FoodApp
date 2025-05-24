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
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [vendor, setVendor] = useState('');

  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera roll.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          openGallery();
        } else {
          console.log('Camera permission denied');
        }
      } else {
        openGallery();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const openGallery = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (!result.didCancel) {
      setImageData(result.assets[0]);
    }
  };

  const uploadImageToCloudinary = async () => {
    const file = {
      uri: imageData.uri,
      type: 'image/jpeg',
      name: 'upload.jpg',
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
      console.log('Cloudinary response:', json);

      if (!res.ok || !json.secure_url) {
        return null;
      }

      return json.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return null;
    }
  };

  const uploadItem = (imageUrl) => {
    firestore()
      .collection('items')
      .add({
        name: name,
        price: parseFloat(price),
        discountPrice: parseFloat(discountPrice),
        description: description,
        imageUrl: imageUrl,
        category: category,
        vendor: vendor,
        rating: 0,
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

  const handleSubmit = async () => {
    if (!name || !price || !category || !vendor || !imageData) {
      Alert.alert('Validation', 'Please fill in all required fields and select an image.');
      return;
    }

    const imageUrl = await uploadImageToCloudinary();
    if (!imageUrl) {
      Alert.alert('Error', 'Failed to upload image.');
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
    setImageData(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Add Food Item</Text>
        </View>

        {imageData && (
          <Image
            source={{ uri: imageData.uri }}
            style={styles.imageStyle}
          />
        )}

        <TextInput
          placeholder="Enter Item Name"
          style={styles.inputStyle}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Enter Item Price"
          style={styles.inputStyle}
          value={price}
          keyboardType="numeric"
          onChangeText={setPrice}
        />
        <TextInput
          placeholder="Enter Item Discount Price"
          style={styles.inputStyle}
          value={discountPrice}
          keyboardType="numeric"
          onChangeText={setDiscountPrice}
        />
        <TextInput
          placeholder="Description"
          style={[styles.inputStyle, { height: 100, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          multiline={true}
          numberOfLines={4}
        />
        <TextInput
          placeholder="Enter Vendor"
          style={styles.inputStyle}
          value={vendor}
          onChangeText={setVendor}
        />

        <View style={[styles.inputStyle, { padding: 0, justifyContent: 'center' }]}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            mode="dropdown"
            style={{ width: '100%' }}
          >
            <Picker.Item label="Select Category" value="" />
            <Picker.Item label="Drinks" value="Drinks" />
            <Picker.Item label="Combos" value="Combos" />
            <Picker.Item label="Sliders" value="Sliders" />
            <Picker.Item label="Classic" value="Classic" />
          </Picker>
        </View>

        <TouchableOpacity
          style={styles.pickBtn}
          onPress={requestCameraPermission}
        >
          <Text>Select Image from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadBtn} onPress={handleSubmit}>
          <Text style={{ color: '#fff' }}>Upload Item</Text>
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
