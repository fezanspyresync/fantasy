import {View, Text, Image, StyleSheet} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Private from './private';
import PublicChat from './publicChat';
import Share from './share';
import {colors} from '../constants/colors';
import PrivateStack from './privatechatstack';
import Rooms from './rooms';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore, {firebase} from '@react-native-firebase/firestore';

const Tab = createBottomTabNavigator();
let user = '';
const Home = () => {
  const [currentPerson, setCurrentPerson] = useState([]);
  const getCurrentPerson = useCallback(async () => {
    user = await AsyncStorage.getItem('user');
  }, []);
  getCurrentPerson();
  useEffect(() => {
    const subscriber = firestore()
      .collection('users')
      .onSnapshot(querySnapShot => {
        const allUsers = querySnapShot.docs.map(item => {
          return {...item.data()};
        });
        const current = allUsers.filter(data => data.name == user);
        setCurrentPerson(current);
        // setResult(allUsers);
      });
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 80,
          backgroundColor: '#CD5C5C',
        },
      }}>
      <Tab.Screen
        name="private"
        component={Private}
        options={{
          tabBarIcon: ({focused, color, size}) => {
            console.log(focused);
            return (
              <>
                {focused ? (
                  <View
                    style={{
                      height: 10,
                      width: 50,
                      backgroundColor: colors.mainColor,
                      zIndex: 10,
                      borderRadius: 10,
                      position: 'absolute',
                      //   left: 0,
                      top: 0,
                    }}></View>
                ) : (
                  <View
                    style={{
                      height: 10,
                      width: 50,
                      //   backgroundColor: 'red',
                      zIndex: 10,
                      //   borderRadius: 10,
                      position: 'absolute',
                      //   left: 0,
                      top: 0,
                    }}></View>
                )}

                <Image
                  source={require('../assets/single-person.png')}
                  style={styles.icons}
                />
              </>
            );
          },
        }}
      />
      <Tab.Screen
        name="public"
        component={Rooms}
        options={{
          tabBarIcon: ({focused, color, size}) => {
            return (
              <>
                {focused ? (
                  <View
                    style={{
                      height: 10,
                      width: 50,
                      backgroundColor: colors.mainColor,
                      zIndex: 10,
                      borderRadius: 10,
                      position: 'absolute',
                      //   left: 0,
                      top: 0,
                    }}></View>
                ) : (
                  <View
                    style={{
                      height: 10,
                      width: 50,
                      //   backgroundColor: 'red',
                      zIndex: 10,
                      //   borderRadius: 10,
                      position: 'absolute',
                      //   left: 0,
                      top: 0,
                    }}></View>
                )}
                <View>
                  <Image
                    source={require('../assets/people.png')}
                    style={styles.icons}
                  />
                  <Text
                    style={{
                      position: 'absolute',
                      right: -8,
                      top: -8,
                      color: colors.mainColor,
                    }}>
                    {currentPerson[0]?.pendingGroupMessages > 0
                      ? currentPerson[0]?.pendingGroupMessages
                      : ''}
                  </Text>
                </View>
              </>
            );
          },
        }}
      />
      {/* <Tab.Screen
        name="privatechatStack"
        component={PrivateStack}
        options={{
          headerShown: false,
          tabBarShowLabel: false,
          // tabBarIcon: () => { },
          tabBarHideOnKeyboard: true,
        }}
      /> */}
      {/* <Tab.Screen name="share" component={Share} /> */}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  icons: {
    height: 40,
    width: 40,
  },
});

export default Home;
