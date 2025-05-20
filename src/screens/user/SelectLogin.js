import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import LanguageModal from '../common/LangaugeModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translation } from '../../utils';

const SelectLogin = ({ navigation }) => {
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [selectedLang, setSelectedLang] = useState(0);

  const saveSelectedLang = async index => {
    await AsyncStorage.setItem('LANG', index + '');
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {selectedLang == 0
          ? translation[0].English
          : selectedLang == 1
            ? translation[0].Tamil
            : selectedLang == 2
              ? translation[0].Hindi
              : selectedLang == 3
                ? translation[0].Punjabi
                : selectedLang == 4
                  ? translation[0].Urdu
                  : null}
      </Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => {
          navigation.navigate('Login');
        }}>
        <Text style={styles.btnText}>Admin Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => {
          navigation.navigate('UserLogin');
        }}>
        <Text style={styles.btnText}>User Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.selectLanguageBtn}
        onPress={() => {
          setLangModalVisible(!langModalVisible);
        }}>
        <Text style={styles.selectLanguageText}>Select Language</Text>
      </TouchableOpacity>

      <LanguageModal
        langModalVisible={langModalVisible}
        setLangModalVisible={setLangModalVisible}
        onSelectLang={x => {
          setSelectedLang(x);
          saveSelectedLang(x);
        }}
      />
    </View>
  );
};

export default SelectLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D32F2F', // đỏ đậm
    marginBottom: 50,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: '#E53935', 
    height: 50,                
    width: '80%',              
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,         
    shadowColor: '#D32F2F',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  btnText: {
    fontSize: 19,             
    color: '#fff',
    fontWeight: '700',
  },

  selectLanguageBtn: {
    position: 'absolute',
    bottom: 30,
    width: '60%',
    height: 50,
    borderWidth: 1.5,
    borderColor: '#D32F2F',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  selectLanguageText: {
    fontSize: 16,
    color: '#D32F2F',
    fontWeight: '600',
  },
});
