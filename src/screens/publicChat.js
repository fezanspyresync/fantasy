import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';
import {Text, TouchableOpacity} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

const audioRecorderPlayer = new AudioRecorderPlayer();

const YourComponent = () => {
  // const [recordSecs, setRecordSecs] = useState(0);
  // const [recordTime, setRecordTime] = useState('');
  // const [currentPositionSec, setCurrentPositionSec] = useState(0);
  // const [currentDurationSec, setCurrentDurationSec] = useState(0);
  // const [playTime, setPlayTime] = useState('');
  // const [duration, setDuration] = useState('');

  // const checkRecordingPermissions = async () => {
  //   try {
  //     const result = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
  //     if (result === RESULTS.GRANTED) {
  //       console.log('Recording permission is granted.');
  //       return true;
  //     } else if (result === RESULTS.DENIED) {
  //       console.log('Recording permission is denied, requesting...');
  //       const requestResult = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
  //       if (requestResult === RESULTS.GRANTED) {
  //         console.log('Recording permission has been granted.');
  //         return true;
  //       } else {
  //         console.log('Recording permission denied.');
  //         return false;
  //       }
  //     } else {
  //       console.log('Recording permission is denied.');
  //       return false;
  //     }
  //   } catch (error) {
  //     console.error(
  //       'Error checking or requesting recording permission:',
  //       error,
  //     );
  //     return false;
  //   }
  // };

  // const onStartRecord = async () => {
  //   const result = await audioRecorderPlayer.startRecorder();
  //   audioRecorderPlayer.addRecordBackListener(e => {
  //     setRecordSecs(e.currentPosition);
  //     setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
  //   });
  //   console.log(result);
  // };

  // const onStopRecord = async () => {
  //   const result = await audioRecorderPlayer.stopRecorder();
  //   audioRecorderPlayer.removeRecordBackListener();
  //   setRecordSecs(0);
  //   console.log(result);
  // };

  // const onStartPlay = async () => {
  //   console.log('onStartPlay');
  //   const msg = await audioRecorderPlayer.startPlayer();
  //   console.log(msg);
  //   audioRecorderPlayer.addPlayBackListener(e => {
  //     setCurrentPositionSec(e.currentPosition);
  //     setCurrentDurationSec(e.duration);
  //     setPlayTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
  //     setDuration(audioRecorderPlayer.mmssss(Math.floor(e.duration)));
  //   });
  // };

  // const onPausePlay = async () => {
  //   await audioRecorderPlayer.pausePlayer();
  // };

  // const onStopPlay = () => {
  //   console.log('onStopPlay');
  //   audioRecorderPlayer.stopPlayer();
  //   audioRecorderPlayer.removePlayBackListener();
  // };

  // useEffect(() => {
  //   // Clean up when unmounting the component
  //   checkRecordingPermissions();
  //   return () => {
  //     audioRecorderPlayer.stopPlayer();
  //     audioRecorderPlayer.stopRecorder();
  //     audioRecorderPlayer.removePlayBackListener();
  //     audioRecorderPlayer.removeRecordBackListener();
  //   };
  // }, []);
  const navigation = useNavigation();
  return (
    <>
      <TouchableOpacity
        onPress={() => {
          const letsMove = async () => {
            await AsyncStorage.removeItem('user');
            navigation.navigate('addgender');
          };
          letsMove();
        }}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </>
  );
};

export default YourComponent;
