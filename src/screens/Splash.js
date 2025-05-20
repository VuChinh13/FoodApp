import { View, StyleSheet, Image } from 'react-native';
import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Splash = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      checkLogin();
    }, 3000);
  }, []);

  const checkLogin = async () => {
    const email = await AsyncStorage.getItem('EMAIL');
    const role = await AsyncStorage.getItem('ROLE');

    if (email !== null && role !== null) {
      if (role === 'admin') {
        navigation.replace('Dashboard');
      } else if (role === 'user') {
        navigation.replace('Home');
      } else {
        navigation.replace('SelectLogin');
      }
    } else {
      navigation.replace('SelectLogin');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../images/logo.png')}
        style={styles.logoImage}
      />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // hoặc 'contain' nếu muốn giữ tỉ lệ
  },
});
