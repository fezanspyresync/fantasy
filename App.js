import React, {useEffect, useRef, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';

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
import firestore from '@react-native-firebase/firestore';
import {Alert, AppState} from 'react-native';
import {Provider, useDispatch, useSelector} from 'react-redux';
import store from './src/store/store';
import {isOnline} from './src/store/slice';
import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';

const Stack = createStackNavigator();

function App() {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const dispatch = useDispatch();

  console.log('uashduasdhuadghuasduyasuydgasdgasuygduyasgduyasgu', isOnline);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async nextAppState => {
        if (nextAppState === 'active') {
          console.log('App has come to the foreground!');
          const user = await AsyncStorage.getItem('user');
          if (user) {
            firestore()
              .collection('users')
              .doc(user)
              .update({
                isLive: true,
              })
              .then(() => {
                console.log('User is online!');
                dispatch(isOnline(true));
              })
              .catch(error => {
                console.log('error while online');
              });
          }
        } else if (nextAppState === 'background') {
          console.log('App is being in background');
          // Place your "kill" state logic here
          const user = await AsyncStorage.getItem('user');
          if (user) {
            firestore()
              .collection('users')
              .doc(user)
              .update({
                isLive: false,
                // connectedPerson: '',
              })
              .then(() => {
                console.log('User is offline!');
                dispatch(isOnline(false));
              })
              .catch(error => {
                console.log('error while offline');
              });
          }
        } else if (nextAppState === 'inactive') {
          console.log('in transaction');
        } else {
          console.log('app is killed');
        }
        appState.current = nextAppState;
        setAppStateVisible(appState.current);
        console.log('AppState', appState.current);
      },
    );
    //FCM HANDLER
    try {
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        console.log(
          'A new FCM message arrived!',
          JSON.stringify(remoteMessage),
        );
      });
      console.log('foreground messages', unsubscribe);
    } catch (error) {
      console.log(error);
    }

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <>
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
      <Toast />
    </>
  );
}

export default App;
