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
  if (typeof recipientToken == 'object' && recipientToken?.length > 0) {
    recipientToken.forEach(async element => {
      const fcmEndpoint = 'https://fcm.googleapis.com/fcm/send';
      const message = {
        to: element,
        data: {
          title: body.name,

          body: body.message
            ? body.message
            : body.video
            ? 'share video'
            : body.image
            ? 'share image'
            : null,
        },
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
        const response = await axios.post(fcmEndpoint, message, {
          headers,
        });
        console.log('FCM message sent successfully:', response.data);
      } catch (error) {
        console.error('Error sending FCM message:', error);
      }
    });
  } else {
    const fcmEndpoint = 'https://fcm.googleapis.com/fcm/send';
    const message = {
      to: recipientToken,
      data: {
        title: body.name,

        body: body.message
          ? body.message
          : body.video
          ? 'share video'
          : body.image
          ? 'share image'
          : null,
      },
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
      const response = await axios.post(fcmEndpoint, message, {
        headers,
      });
      console.log('FCM message sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending FCM message:', error);
    }
  }
}

//forground FCM LISnter
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';

// Must be outside of any component LifeCycle (such as `componentDidMount`).
PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister: function (token) {
    console.log('TOKEN:', token);
  },

  // (required) Called when a remote is received or opened, or local notification is opened
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);

    // process the notification

    // (required) Called when a remote is received or opened, or local notification is opened
    notification.finish(PushNotificationIOS.FetchResult.NoData);
  },

  // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
  onAction: function (notification) {
    console.log('ACTION:', notification.action);
    console.log('NOTIFICATION:', notification);

    // process the action
  },

  // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError: function (err) {
    console.error(err.message, err);
  },

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Should the initial notification be popped automatically
  // default: true
  popInitialNotification: true,

  /**
   * (optional) default: true
   * - Specified if permissions (ios) and token (android and ios) will requested or not,
   * - if not, you must call PushNotificationsHandler.requestPermissions() later
   * - if you are not using remote notification or do not have Firebase installed, use this:
   *     requestPermissions: Platform.OS === 'ios'
   */
  requestPermissions: true,
});
