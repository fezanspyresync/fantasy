import {View, Text, StyleSheet, Image} from 'react-native';
import React, {useEffect} from 'react';
import {create} from 'react-test-renderer';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Splash = () => {
  const navigation = useNavigation();
  useEffect(() => {
    setTimeout(() => {
      async function checkIsUserRegister() {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          navigation.replace('home');
        } else {
          navigation.replace('addgender');
        }
      }
      checkIsUserRegister();
    }, 3000);
  }, []);
  return (
    <View style={styles.container}>
      <Image source={require('../assets/splash.png')} style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
});
export default Splash;
