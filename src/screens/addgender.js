import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {socket} from '../..';
import firestore from '@react-native-firebase/firestore';

const Addgender = () => {
  const navigation = useNavigation();
  function generateRandomNenoSeconds() {
    const milliseconds = performance.now();
    const nanoseconds = milliseconds * 1e6; // 1e6 is equivalent to 1,000,000
    return Math.floor(nanoseconds); // Round down to the nearest whole number
  }

  const enterInRoom = async gender => {
    const randomNenoSeconds = generateRandomNenoSeconds();
    await AsyncStorage.setItem('user', `anon${randomNenoSeconds}`);
    // socket.emit('createuser', `anon${randomNenoSeconds}`, gender);
    firestore()
      .collection('users')
      .doc(`anon${randomNenoSeconds}`)
      .set({
        name: `anon${randomNenoSeconds}`,
        userID: `anon${randomNenoSeconds}`,
        gender,
        image:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIodoRRAcrLqFgMvGcLqwFDo6CIQm7ldguJQ&usqp=CAU',
      })
      .then(() => {
        navigation.navigate('home');
      })
      .catch(error => {
        console.log(error);
      });
  };
  return (
    <View style={styles.container}>
      <View style={styles.imagesContainer}>
        <TouchableOpacity onPress={() => enterInRoom('male')}>
          <Image source={require('../assets/male.png')} style={styles.image} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => enterInRoom('female')}>
          <Image
            source={require('../assets/female.png')}
            style={styles.image}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  imagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  image: {
    width: 80,
    height: 80,
  },
});
export default Addgender;
