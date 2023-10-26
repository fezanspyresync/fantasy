import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';

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
//send remote notification
import axios from 'axios';

export async function sendFCMMessage(recipientToken, title, body) {
  const fcmEndpoint = 'https://fcm.googleapis.com/fcm/send';

  const message = {
    to: recipientToken,
    notification: {
      title: body.name,
      body: body.message
        ? body.message
        : body.video
        ? body.video
        : body.image
        ? body.image
        : null,
    },
  };

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer AAAAIlQNIuc:APA91bEgJ8Gihrrl75V9mHoocLXti257YynEwBdYFHdwBVXmfuIGoS1UFDSxOjYLu_G8whje49ddNzr9IAWgp6311zk-W5b0mPCd-CiIoBwlNnujwwHnVAvKifD-45hk6nVaE4aUk5c8`,
  };

  try {
    const response = await axios.post(fcmEndpoint, message, {headers});
    console.log('FCM message sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending FCM message:', error);
  }
}
