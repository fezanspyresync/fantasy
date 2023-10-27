import React, {useCallback, useEffect, useRef, useState} from 'react';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import messaging from '@react-native-firebase/messaging';

const RemotePushController = props => {
  useEffect(() => {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      // (required) Called when a remote or local notification is opened or received
      onNotification: function (notification) {
        console.log(
          '=========================Notification===================================',
          notification,
        );
        notification.finish(PushNotificationIOS.FetchResult.NoData);
        // if (notification.userInteraction) {
        //     if (Platform.OS === 'ios') {
        //         PushNotification.cancelLocalNotifications({ id: notification.data.id });
        //     } else {
        //         PushNotification.cancelLocalNotifications({ id: notification.id });
        //     }
        // }
        let naviType = '';
      },
      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: function (notification) {
        console.log('ACTION:', notification);
        console.log('NOTIFICATION:', notification);

        // process the action
      },
      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: function (err) {
        console.error('error==>'.err?.message, err);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      // Android only: GCM or FCM Sender ID
      senderID: '147439035111',
      popInitialNotification: true,
      requestPermissions: true,
    });
    PushNotification.createChannel(
      {
        channelId: 'fantasy', // (required)
        channelName: 'fantasy', // (required)
        channelDescription: 'A channel to categorise your notifications', // (optional) default: undefined.
        playSound: true, // (optional) default: true
        soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
        importance: 4, // (optional) default: 4. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
        autoCancel: true,
        showWhen: true,
        largeIcon: 'ic_launcher',
        smallIcon: 'ic_launcher',
        color: 'red',
      },
      created => console.log(`createChannel returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
    );

    const subscribe = messaging().onMessage(async remoteMessage => {
      console.log('Message===>', remoteMessage);
    });

    return subscribe;

    PushNotification.localNotification({
      ticker: 'My Notification Ticker', // (optional)
      showWhen: true, // (optional) default: true
      autoCancel: true, // (optional) default: true
      largeIcon: 'ic_launcher', // (optional) default: "ic_launcher". Use "" for no large icon.
      largeIconUrl: 'https://www.example.tld/picture.jpg', // (optional) default: undefined
      smallIcon: 'ic_notification', // (optional) default: "ic_notification" with fallback for "ic_launcher". Use "" for default small icon.
      bigText: 'My big text that will be shown when notification is expanded', // (optional) default: "message" prop
      subText: 'This is a subText', // (optional) default: none
      bigPictureUrl: 'https://www.example.tld/picture.jpg', // (optional) default: undefined
      bigLargeIcon: 'ic_launcher', // (optional) default: undefined
      bigLargeIconUrl: 'https://www.example.tld/bigicon.jpg', // (optional) default: undefined
      color: 'red', // (optional) default: system default
      vibrate: true, // (optional) default: true
    });
  }, []);
  return null;
};
export default RemotePushController;
