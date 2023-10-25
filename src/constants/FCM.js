import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    FCM_TOKEN_HANDLER();
  }
}

const FCM_TOKEN_HANDLER = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    console.log('existing token', token);
    if (!token) {
      const token = await messaging().getToken();
      await AsyncStorage.setItem('token', token);
      console.log('sfdfdsfutooken', token);
    }
  } catch (error) {
    console.log(error);
  }
};
