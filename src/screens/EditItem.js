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
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import { useRoute } from '@react-navigation/native';

// Import Picker
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
  const [imageUrl, setImageUrl] = useState('');

  // Thêm state vendor
  const [vendor, setVendor] = useState(route.params.data.vendor || '');

  // Thêm state category, lấy giá trị ban đầu từ data
  const [category, setCategory] = useState(route.params.data.category || '');

  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Cool Photo App Camera Permission',
            message:
              'Cool Photo App needs access to your camera ' +
              'so you can take awesome pictures.',
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
    if (result.didCancel) {
      // user cancelled
    } else {
      setImageData(result);
    }
  };

  // Nếu muốn upload ảnh mới lên Firebase Storage (hiện chưa sử dụng)
  const uploadImage = async () => {
    if (!imageData.assets[0].fileName) {
      return;
    }
    const reference = storage().ref(imageData.assets[0].fileName);
    const pathToFile = imageData.assets[0].uri;
    await reference.putFile(pathToFile);
    const url = await reference.getDownloadURL();
    uploadItem(url);
  };

  const uploadItem = (uploadedImageUrl) => {
    firestore()
      .collection('items')
      .doc(route.params.id)
      .update({
        name: name,
        price: price,
        discountPrice: discountPrice,
        description: description,
        imageUrl: uploadedImageUrl || route.params.data.imageUrl,
        category: category,
        vendor: vendor, // cập nhật vendor
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

        {imageData !== null && imageData.assets && imageData.assets.length > 0 ? (
          <Image
            source={{ uri: imageData.assets[0].uri }}
            style={styles.imageStyle}
          />
        ) : null}

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
          style={[styles.inputStyle, { height: 100, textAlignVertical: 'top' }]} // tăng chiều cao để nhập nhiều dòng
          value={description}
          onChangeText={setDescription}
          multiline={true}
          numberOfLines={4}
        />

        {/* Thêm TextInput cho Vendor */}
        <TextInput
          placeholder="Enter Vendor"
          style={styles.inputStyle}
          value={vendor}
          onChangeText={setVendor}
        />
        <TextInput
          placeholder="Enter Item Image URL"
          style={styles.inputStyle}
          value={imageUrl}
          onChangeText={setImageUrl}
        />

        {/* Picker chọn category */}
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

        <Text style={{ alignSelf: 'center', marginTop: 20 }}>OR</Text>

        <TouchableOpacity
          style={styles.pickBtn}
          onPress={() => requestCameraPermission()}
        >
          <Text>Select Image from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => {
            // Nếu muốn upload ảnh lên Firebase Storage trước rồi mới update Firestore, gọi uploadImage()
            // uploadImage();

            // Hiện tại chỉ cập nhật Firestore với imageUrl hiện tại
            uploadItem(imageUrl ? imageUrl : null);
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
