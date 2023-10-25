import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import React, {useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {socket} from '../..';
import firestore from '@react-native-firebase/firestore';
import {requestUserPermission} from '../constants/FCM';

const Addgender = () => {
  const navigation = useNavigation();
  function generateRandomNenoSeconds() {
    const milliseconds = performance.now();
    const nanoseconds = milliseconds * 1e6; // 1e6 is equivalent to 1,000,000
    return Math.floor(nanoseconds); // Round down to the nearest whole number
  }

  const enterInRoom = async gender => {
    const token = await AsyncStorage.getItem('token');
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
          gender == 'female'
            ? 'https://i.pinimg.com/736x/2b/ff/a2/2bffa2ba2a43533ed855d46916f70dae.jpg'
            : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRi88CIQNMqnNgUokI1b30sv3Di18VoPNrbLw&usqp=CAU',
        isLive: true,
        connectedPerson: '',
        isTyping: false,
        pendingMessages: [],
        token,
      })
      .then(() => {
        navigation.replace('home');
      })
      .catch(error => {
        console.log(error);
      });
  };
  useEffect(() => {
    requestUserPermission();
  }, []);
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
