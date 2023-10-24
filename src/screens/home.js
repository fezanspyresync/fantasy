import {View, Text, Image, StyleSheet} from 'react-native';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Private from './private';
import PublicChat from './publicChat';
import Share from './share';
import {colors} from '../constants/colors';
import PrivateStack from './privatechatstack';

const Tab = createBottomTabNavigator();

const Home = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 80,
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
        component={PublicChat}
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
                <Image
                  source={require('../assets/people.png')}
                  style={styles.icons}
                />
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
