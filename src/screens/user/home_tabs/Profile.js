import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            // Xóa dữ liệu đăng nhập
            await AsyncStorage.multiRemove(['EMAIL', 'ROLE', 'USERID', 'MOBILE', 'NAME']);
            // Điều hướng về màn hình Splash
            navigation.replace('Splash');
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 40,
  },
  logoutBtn: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 30,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
});
