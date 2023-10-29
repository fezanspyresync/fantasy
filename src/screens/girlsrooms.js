import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Touchable,
  StatusBar,
  Tab,
  Alert,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {colors} from '../constants/colors';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import moment from 'moment';

import VideoPlayer from 'react-native-video-player';
import Modal from 'react-native-modal';
import Feather from 'react-native-vector-icons/Feather';
import firestore, {firebase} from '@react-native-firebase/firestore';
import {PERMISSIONS, request} from 'react-native-permissions';
import DocumentPicker from 'react-native-document-picker';
import RNFetchBlob from 'react-native-fetch-blob';
import storage from '@react-native-firebase/storage';
import {sendFCMMessage} from '../constants/FCM';
import EmojiSelector, {Categories} from 'react-native-emoji-selector';
import {all} from 'axios';

let currentPerson = '';
const Girlsroom = () => {
  // const {name, image, isLive} = route.params;
  const navigation = useNavigation();
  const route = useRoute();
  const [message, setMessage] = useState('');
  const isFocus = useIsFocused();

  const flatListRef = useRef();

  const [result, setResult] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [video, setVideo] = useState('');
  const [image, setImage] = useState('');
  const [isPersonAvailable, setIsPersonAvailable] = useState('');
  const [personalInfo, setPersonalInfo] = useState([]);
  const [isCurrentPersonInteractingMe, setIsCurrentPersonInteractingMe] =
    useState('');
  const [isPersonTyping, setIsPersonTyping] = useState('');
  let typingTimeout;
  // let pendingMessageCounter = 0;
  const [pendingMessageCounter, setPendingMessageCounter] = useState(0);
  const [ReceiverToken, setReceiverToken] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [alloffLineUsers, setAlloffLineUsers] = useState([]);
  const [offlineToken, setofflineToken] = useState([]);
  console.log('off', alloffLineUsers);
  const messageHandler = msg => {
    setMessage(msg);
  };

  const messageSubmitHandler = async (image = '', video = '') => {
    Keyboard.dismiss();
    setLoading(true);
    if (message || image || video) {
      const payload = {
        from: currentPerson,
        video,
        image,
        message,
        timeStamp: new Date().getTime(),
        mesageSendTime: moment().format('LT'),
      };
      //working on pending messages
      if (offlineToken.length > 0) {
        sendFCMMessage(offlineToken, 'message', payload);
      }
      //running
      firestore()
        .collection('girlsChat')

        .add(payload)
        .then(() => {
          console.log('message is send');
        })
        .catch(() => {
          console.log('sending problem');
        });
      setLoading(false);
      //pending cause problem
      if (alloffLineUsers.length > 0) {
        alloffLineUsers.forEach(data => {
          firestore()
            .collection('users')
            .doc(data.name)
            .update({
              pendingGroupMessages: Number(data.pendingGroupMessages + 1),
            });
        });
      }

      setMessage('');
      setVideo('');
      setImage('');
    }
  };
  const backHandler = useCallback(() => {
    navigation.goBack();
  }, []);
  const displayMediaHandler = useCallback(media => {
    navigation.navigate('displaymedia', media);
  }, []);
  // getting all conversation
  useEffect(() => {
    const getCurrentPerson = async () => {
      const currentUser = await AsyncStorage.getItem('user');
      currentPerson = currentUser;
    };
    getCurrentPerson();
    const subscriber = firestore()
      .collection('girlsChat')
      .orderBy('timeStamp', 'asc')
      .onSnapshot(querySnapShot => {
        const allMessages = querySnapShot.docs.map(item => {
          return {...item.data()};
        });
        setResult(allMessages);
      });
  }, []);

  useEffect(() => {
    const subscriber = firestore()
      .collection('users')
      .onSnapshot(querySnapShot => {
        const allUsers = querySnapShot.docs.map(item => {
          return {...item.data()};
        });
        const allOffLineUsers = allUsers.filter(
          data => data.isInGroup == false,
        );
        setAlloffLineUsers(allOffLineUsers);
        const offlineUserstoken = [];
        allOffLineUsers.forEach(data => {
          offlineUserstoken.push(data.token);
        });

        setofflineToken(offlineUserstoken);

        // setResult(allUsers);
      });

    return () => {
      firestore().collection('users').doc(currentPerson).update({
        isInGroup: false,
      });
    };
  }, []);

  const requestPermissions = useCallback(async () => {
    try {
      const status = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);

      if (status === 'granted') {
        pickDocument();
      } else {
      }
    } catch (error) {}
  }, []);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.video,
          DocumentPicker.types.images,
          // DocumentPicker.types.pdf,
        ],
      });

      if (result.length > 0) {
        const mimeType = result[0].type;

        if (mimeType.startsWith('video/')) {
          setLoading(true);
          // Handle video upload
          const path = result[0].uri;
          const limitVideoSize = 44788857;
          if (result[0].size > limitVideoSize) {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'file size is to large',
            });
            setLoading(false);
            return;
          }

          const res = await RNFetchBlob.fs.readFile(path, 'base64');
          const blobData = `data:${mimeType};base64,${res}`;

          const filename =
            new Date().getTime() + `.${mimeType.replace('video/', '')}`;
          const reference = storage().ref(filename);

          await reference.putString(blobData, 'data_url');

          const videoUrl = await storage().ref(filename).getDownloadURL();
          setLoading(false);

          // setVideo(videoUrl);
          messageSubmitHandler(undefined, videoUrl);

          // You can do further processing or set the video URL as needed
        } else if (mimeType.startsWith('image/')) {
          setLoading(true);
          // Handle video upload
          const path = result[0].uri;

          const res = await RNFetchBlob.fs.readFile(path, 'base64');
          const blobData = `data:${mimeType};base64,${res}`;

          const filename =
            new Date().getTime() + `.${mimeType.replace('image/', '')}`;
          const reference = storage().ref(filename);

          await reference.putString(blobData, 'data_url');

          const ImageUrl = await storage().ref(filename).getDownloadURL();
          setLoading(false);

          // setImage(ImageUrl);
          messageSubmitHandler(ImageUrl, undefined);
          // Handle image upload
          // You can add your image handling logic here
        } else if (mimeType.startsWith('application/')) {
          if (result[0].size == 115924) {
            try {
              // Handle video upload
              const path = result[0].uri;

              const res = await RNFetchBlob.fs.readFile(path, 'base64');
              const blobData = `data:${mimeType};base64,${res}`;

              const filename =
                new Date().getTime() +
                `.${mimeType.replace('application/', '')}`;
              const reference = storage().ref(filename);

              await reference.putString(blobData, 'data_url');

              const videoUrl = await storage().ref(filename).getDownloadURL();
            } catch (error) {}
          } else {
          }
        } else {
        }
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      } else {
      }
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <View style={[styles.messsageOverAllContainer]}>
          <View style={styles.messageTextContainer}>
            <TouchableOpacity
              onPress={() => {
                setIsOpen(!isOpen);
                Keyboard.dismiss();
              }}>
              <Entypo
                name="emoji-happy"
                size={30}
                color={colors.girlsRoomColor}
              />
            </TouchableOpacity>
            <TextInput
              ref={inputRef}
              value={message}
              onChangeText={messageHandler}
              placeholder="Message"
              placeholderTextColor="#000"
              style={styles.input}
              multiline
              onFocus={daa => {
                console.log(daa, 'onfocya');
                setIsOpen(false);
              }}
            />
            <Entypo
              name="attachment"
              size={30}
              color={colors.girlsRoomColor}
              onPress={() => requestPermissions()}
            />
          </View>
          <TouchableOpacity
            style={styles.sendContainer}
            onPress={() => {
              messageSubmitHandler();
            }}>
            <MaterialIcons name="send" size={30} color={'white'} />
          </TouchableOpacity>
        </View>
        {isOpen && (
          <View style={{height: heightPercentageToDP(40)}}>
            <EmojiSelector
              showHistory={true}
              showSearchBar={false}
              category={Categories.symbols}
              onEmojiSelected={emoji => {
                setMessage(message + emoji);
              }}
            />
          </View>
        )}
      </View>

      <View style={styles.messageList}>
        {result.length !== 0 && (
          <FlatList
            ref={flatListRef}
            data={result}
            renderItem={({item}) => {
              return (
                <View
                  style={{
                    margin: 10,

                    alignItems:
                      item.from == currentPerson ? 'flex-end' : 'flex-start',
                  }}>
                  <TouchableOpacity
                    style={[
                      {
                        //   minHeight: 20,
                        minWidth: widthPercentageToDP(30),
                        //   maxHeight: heightPercentageToDP(10),
                        maxWidth: widthPercentageToDP(70),
                        padding: 10,

                        overflow: item.image || item.video ? 'hidden' : null,
                        borderRadius: 4,
                        backgroundColor:
                          item.from == currentPerson
                            ? colors.girlsRoomColor
                            : 'gray',
                      },
                      item.image && {
                        height: heightPercentageToDP(40),
                        width: widthPercentageToDP(100),
                        padding: 0,
                      },
                      item.video && {
                        height: heightPercentageToDP(40),
                        width: widthPercentageToDP(100),
                        padding: 0,
                      },
                    ]}>
                    {item.message && (
                      <Text style={{color: 'white', fontSize: 16}}>
                        {item.message}
                      </Text>
                    )}
                    {item.image && (
                      <Image
                        source={{uri: item.image}}
                        style={{
                          height: '100%',
                          width: '100%',
                          resizeMode: 'cover',
                        }}
                      />
                    )}
                    {item.video && (
                      <VideoPlayer
                        video={{
                          uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                        }}
                        defaultMuted
                        disableControlsAutoHide
                        fullScreenOnLongPress
                        autoplay={false}
                        style={{
                          height: '100%',
                          width: '100%',
                          resizeMode: 'cover',
                        }}
                      />
                    )}

                    <Text
                      style={{
                        color: '#000',
                        // position: 'absolute',
                        // right: 20,
                        // bottom: 1,
                        textAlign: 'right',
                        fontSize: 12,
                        zIndex: 100,
                      }}>
                      {item.mesageSendTime}
                    </Text>
                    {/* <Text
                      style={{
                        textAlign: 'right',
                        zIndex: 100,
                        fontSize: 12,
                        color: '#000',
                      }}>
                      {item.from == route.params.id
                        ? item.isMessageScene
                          ? 'seen'
                          : 'deliever'
                        : ''}
                    </Text> */}
                    {item.video || item.image ? (
                      <TouchableOpacity
                        onPress={() => displayMediaHandler(item)}
                        style={{
                          backgroundColor: 'transparent',
                          height: '100%',
                          width: '100%',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                        }}></TouchableOpacity>
                    ) : null}
                  </TouchableOpacity>
                </View>
              );
            }}
            keyExtractor={(item, index) => index.toString()}
            onContentSizeChange={() => {
              flatListRef.current.scrollToEnd({animated: true});
            }}
          />
        )}
      </View>
      <View style={styles.ReceiverProfileContainer}>
        <TouchableOpacity onPress={() => backHandler()}>
          <MaterialIcons name="arrow-back" size={30} color={'white'} />
        </TouchableOpacity>
        {/* <Image
          source={{uri: route.params.data.image}}
          style={styles.receiverImage}
        /> */}
        <View>
          {/* <Text style={styles.receiverName}>{route.params.data.name}</Text> */}
          {/* {isPersonTyping ? (
            <Text style={styles.receiverName}>typing...</Text>
          ) : (
            <Text style={styles.receiverName}>
              {isPersonAvailable ? 'Online' : 'offline'}
            </Text>
          )} */}
        </View>
      </View>
      {loading && (
        <ActivityIndicator
          size="large"
          color={colors.girlsRoomColor}
          style={{position: 'absolute', left: '45%', top: '45%'}}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column-reverse',
    backgroundColor: '#ffffff',
  },
  messsageOverAllContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginBottom: 5,
    paddingBottom: 5,
    paddingHorizontal: 10,
    backgroundColor: '#F7CBC0',
  },
  messageTextContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.girlsRoomColor,
    alignItems: 'center',
    paddingHorizontal: widthPercentageToDP(4),
    borderRadius: 30,
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  sendContainer: {
    height: heightPercentageToDP(8),
    width: widthPercentageToDP(16),
    borderRadius: 50,
    backgroundColor: colors.girlsRoomColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  messageList: {
    flex: 1,
    paddingVertical: 1,
    backgroundColor: '#F7CBC0',
  },
  ReceiverProfileContainer: {
    // height: heightPercentageToDP(12),
    backgroundColor: colors.girlsRoomColor,
    flexDirection: 'row',
    paddingVertical: heightPercentageToDP(1),
    alignItems: 'center',
  },
  receiverImage: {
    height: heightPercentageToDP(6),
    width: widthPercentageToDP(12),
    borderRadius: 50,
    marginLeft: widthPercentageToDP(2),
  },
  receiverName: {
    color: '#000',
    marginLeft: widthPercentageToDP(2),
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});
export default Girlsroom;
