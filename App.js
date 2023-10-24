import React, {useEffect} from 'react';
import {NavigationContainer, useIsFocused} from '@react-navigation/native';

import Splash from './src/screens/splash';
import Addname from './src/screens/addname';
import Addgender from './src/screens/addgender';
import Verify from './src/screens/verify';
import Home from './src/screens/home';
import {createStackNavigator} from '@react-navigation/stack';
import PrivateChat from './src/screens/privatechatroom';
import Displaymedia from './src/screens/displaymedia';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {socket} from '.';
const Stack = createStackNavigator();

function App() {
  // useEffect(() => {
  //   return async function () {
  //     const user = await AsyncStorage.getItem('user');
  //     if (user) {
  //       socket.emit('currentUserOffline', {user, isLive: false});
  //     }
  //   };
  // }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="splash"
          component={Splash}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="addname"
          component={Addname}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="displaymedia"
          component={Displaymedia}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="privateChat"
          component={PrivateChat}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="addgender"
          component={Addgender}
          options={{headerShown: false}}
        />
        <Stack.Screen name="Verification" component={Verify} />
        <Stack.Screen
          name="home"
          component={Home}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
