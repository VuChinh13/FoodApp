import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRoute } from '@react-navigation/native';

const OrderStatus = ({ navigation }) => {
  const route = useRoute();
  const { status } = route.params;

  return (
    <View style={styles.container}>
      <Image
        source={
          status === 'success'
            ? require('../../../images/success.gif')
            : require('../../../images/failed.gif')
        }
        style={styles.icon}
      />
      <Text style={styles.msg}>
        {status === 'success'
          ? 'Order Placed Successfully !!'
          : 'Order Failed !!'}
      </Text>
      <TouchableOpacity
        style={styles.backToHome}
        onPress={() => {
          navigation.navigate('Home');
        }}>
        <Text>Go To Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OrderStatus;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: '70%',
    height: '40%',
    alignSelf: 'center',
  },
  msg: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginTop: -50,
  },
  backToHome: {
    width: '50%',
    height: 50,
    borderWidth: 0.5,
    marginTop: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
