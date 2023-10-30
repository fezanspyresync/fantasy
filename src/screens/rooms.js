import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {useCallback} from 'react';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore, {firebase} from '@react-native-firebase/firestore';
import Feather from 'react-native-vector-icons/Feather';
const Rooms = () => {
  const navigation = useNavigation();

  const navigateToGirlsRoom = useCallback(async () => {
    const currentPerson = await AsyncStorage.getItem('user');
    firestore()
      .collection('users')
      .doc(currentPerson)
      .update({
        isInGroup: true,
        pendingGroupMessages: Number(0),
      });
    setTimeout(() => {
      navigation.navigate('girlsroom');
    }, 300);
  }, []);

  return (
    <View style={styles.container}>
      <View
        style={{
          width: widthPercentageToDP(90),
          backgroundColor: colors.girlsRoomColor,
          alignItems: 'center',
          paddingVertical: 30,
          borderRadius: 10,
        }}>
        <View
          style={{
            height: 100,
            width: 100,
            borderRadius: 50,
            borderWidth: 2,
            overflow: 'hidden',
            backgroundColor: 'red',
          }}>
          <Image
            source={require('../assets/female.png')}
            style={{height: '100%', width: '100%', resizeMode: 'cover'}}
          />
        </View>
        <TouchableOpacity
          style={{marginVertical: 30}}
          onPress={() => navigateToGirlsRoom()}>
          <Text style={{color: 'white', fontSize: 18}}>Enter in room</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          width: widthPercentageToDP(90),
          backgroundColor: colors.girlsRoomColor,
          alignItems: 'center',
          paddingVertical: 30,
          borderRadius: 10,
          marginTop: 20,
        }}>
        <View
          style={{
            height: 100,
            width: 100,
            borderRadius: 50,
            borderWidth: 2,
            overflow: 'hidden',
            backgroundColor: 'red',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Feather name="phone-call" size={45} color="white" />
        </View>
        <TouchableOpacity
          style={{marginTop: 30}}
          onPress={() => navigation.navigate('plan')}>
          <Text style={{color: 'white', fontSize: 18}}>Live Video Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Rooms;
