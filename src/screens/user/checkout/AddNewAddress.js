import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddNewAddress = ({navigation}) => {
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [mobile, setMobile] = useState('');

  const validateInputs = () => {
    if (!street.trim() || !city.trim() || !pincode.trim() || !mobile.trim()) {
      Alert.alert('Validation Error', 'All fields are required.');
      return false;
    }
    if (pincode.length < 5) {
      Alert.alert('Validation Error', 'Pincode must be at least 5 digits.');
      return false;
    }
    if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
      Alert.alert('Validation Error', 'Mobile number must be exactly 10 digits.');
      return false;
    }
    return true;
  };

  const saveAddress = async () => {
    if (!validateInputs()) {
      return;
    }

    try {
      const addressId = uuid.v4();
      const userId = await AsyncStorage.getItem('USERID');
      const userDoc = await firestore().collection('users').doc(userId).get();

      let addressList = userDoc._data?.address || []; // ✅ Safe fallback
      addressList.push({street, city, pincode, mobile, addressId});

      await firestore().collection('users').doc(userId).update({
        address: addressList,
      });

      console.log('Successfully added');
      navigation.goBack();
    } catch (error) {
      console.log('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.inputStyle}
        placeholder={'Enter Street'}
        value={street}
        onChangeText={txt => setStreet(txt)}
      />
      <TextInput
        style={styles.inputStyle}
        placeholder={'Enter City'}
        value={city}
        onChangeText={txt => setCity(txt)}
      />
      <TextInput
        style={styles.inputStyle}
        placeholder={'Enter Pincode'}
        value={pincode}
        keyboardType="number-pad"
        onChangeText={txt => setPincode(txt)}
      />
      <TextInput
        style={styles.inputStyle}
        placeholder={'Enter Mobile'}
        value={mobile}
        maxLength={10}
        keyboardType="number-pad"
        onChangeText={txt => setMobile(txt)}
      />
      <TouchableOpacity
        style={styles.addNewBtn}
        onPress={saveAddress}>
        <Text style={styles.btnText}>Save Address</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddNewAddress;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputStyle: {
    paddingLeft: 20,
    height: 50,
    alignSelf: 'center',
    marginTop: 30,
    borderWidth: 0.5,
    borderRadius: 10,
    width: '90%',
  },
  addNewBtn: {
    width: '90%',
    height: 50,
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    borderRadius: 10,
  },
  btnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
