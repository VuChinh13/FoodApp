import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  PermissionsAndroid,
  Image,
  ScrollView,
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
            title: 'App Camera Permission',
            message: 'App needs access to your camera to select images.',
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
      setImageData(result);
    }
  };

  const uploadImageToCloudinary = async () => {
  const file = {
    uri: imageData.assets[0].uri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  };

  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset', 'upload_zxmimtwp');  // preset đúng
  data.append('folder', 'admin_food');

  try {
    const res = await fetch('https://api.cloudinary.com/v1_1/dsjsdyba7/image/upload', {
      method: 'POST',
      body: data,
    });

    const json = await res.json();
    console.log('Cloudinary response:', json); // ✅ debug thêm nếu cần

    if (!res.ok || !json.secure_url) {
      return null;
    }

    return json.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return null;
  }
};


  const uploadItem = (uploadedImageUrl) => {
    firestore()
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
      })
      .then(() => {
        console.log('Item updated!');
        navigation.goBack();
      })
      .catch(error => {
        console.error('Update error:', error);
        alert('Failed to update item.');
      });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Edit Item</Text>
        </View>

        {imageData?.assets?.length > 0 && (
          <Image
            source={{ uri: imageData.assets[0].uri }}
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
          value={price.toString()}
          keyboardType="numeric"
          onChangeText={setPrice}
        />
        <TextInput
          placeholder="Enter Item Discount Price"
          style={styles.inputStyle}
          value={discountPrice.toString()}
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
                alert('Failed to upload image');
                return;
              }
            }

            uploadItem(finalImageUrl);
          }}
        >
          <Text style={{ color: '#fff' }}>Upload Item</Text>
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
