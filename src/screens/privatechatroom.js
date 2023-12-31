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
import React, {useEffect, useMemo, useRef, useState} from 'react';
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
// import {SP_KEY} from '@env';

const PrivateChat = () => {
  // const {name, image, isLive} = route.params;
  // Alert.alert(SP_KEY);
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
  const messageHandler = msg => {
    if (
      isCurrentPersonInteractingMe == route.params.id &&
      isPersonAvailable == true
    ) {
      firestore().collection('users').doc(route.params.id).update({
        isTyping: true,
      });

      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        firestore().collection('users').doc(route.params.id).update({
          isTyping: false,
        });
      }, 1000);
    } else {
      // pendingMessageCounter=pendingMessageCounter
      firestore().collection('users').doc(route.params.id).update({
        isTyping: false,
      });
    }
    setMessage(msg);
  };

  console.log('ysagdysadysafd', isPersonTyping);

  const messageSubmitHandler = async (image = '', video = '') => {
    Keyboard.dismiss();
    // const user = await AsyncStorage.getItem('user');
    setLoading(true);
    if (message || image || video) {
      const payload = {
        from: route.params.id,
        to: route.params.data.name,
        video,
        image,
        message,
        timeStamp: new Date().getTime(),
        mesageSendTime: moment().format('LT'),
        isMessageScene:
          isCurrentPersonInteractingMe == route.params.id &&
          isPersonAvailable == true
            ? true
            : false,
      };
      //working on pending messages
      if (isCurrentPersonInteractingMe !== route.params.id) {
        if (personalInfo[0].pendingMessages.length > 0) {
          const filterMyMessages = personalInfo[0].pendingMessages.filter(
            data => data.receiver == route.params.data.name,
          );
          if (filterMyMessages.length > 0) {
            filterMyMessages[0].totalMessages = ++filterMyMessages[0]
              .totalMessages;

            firestore().collection('users').doc(route.params.id).update({
              pendingMessages: personalInfo[0].pendingMessages,
            });
          } else {
            const payload = {
              receiver: route.params.data.name,
              totalMessages: 1,
            };
            const addNewPerson = [...personalInfo[0].pendingMessages, payload];
            firestore().collection('users').doc(route.params.id).update({
              pendingMessages: addNewPerson,
            });
          }
        } else {
          const payload = {
            receiver: route.params.data.name,
            totalMessages: 1,
          };
          firestore()
            .collection('users')
            .doc(route.params.id)
            .update({
              pendingMessages: [payload],
            });
        }
      }

      if (
        !isPersonAvailable ||
        isCurrentPersonInteractingMe !== route.params.id
      ) {
        sendFCMMessage(ReceiverToken, 'message', payload);
      }

      firestore()
        .collection('chats')
        .doc('' + route.params.id + route.params.data.name)
        .collection('messages')
        .add(payload)
        .then(() => {
          console.log('message is send');
        })
        .catch(() => {
          console.log('message is received');
        });
      // socket.emit('sendPrivateMessage', payload, name);
      setLoading(false);
      firestore()
        .collection('chats')
        .doc('' + route.params.data.name + route.params.id)
        .collection('messages')
        .add(payload)
        .then(() => {
          console.log('message is send');
        })
        .catch(() => {
          console.log('message is received');
        });
      // socket.emit('sendPrivateMessage', payload, name);

      setMessage('');
      setVideo('');
      setImage('');
    } else {
      setLoading(false);
    }
  };
  const backHandler = () => {
    navigation.goBack();
  };
  const displayMediaHandler = media => {
    navigation.navigate('displaymedia', media);
  };
  // getting all conversation
  useEffect(() => {
    seenMessageHandler();
    const subscriber = firestore()
      .collection('chats')
      .doc('' + route.params.id + route.params.data.name)
      .collection('messages')
      .orderBy('timeStamp', 'asc')
      .onSnapshot(querySnapShot => {
        // if (isCurrentPersonInteractingMe == route.params.data.name) {
        //   seenMessageHandler();
        // }

        const allMessages = querySnapShot.docs.map(item => {
          // updating scene messages if contact person is not present

          return {...item.data()};
        });
        setResult(allMessages);
      });

    // return () => subscriber();
  }, []);

  useEffect(() => {
    seenMessageHandler();
  }, [isFocus]);

  //seenMessageHandler
  const seenMessageHandler = item => {
    //remove pending messages
    //remove something
    console.log('fiushfiusdhfsfdufsuihdhf', route.params.data.pendingMessages);
    if (route.params.data.pendingMessages.length > 0) {
      const filterMyData = route.params.data?.pendingMessages.filter(
        data => data.receiver == route.params.id,

        console.log('asgduyasgduyasdyasg', filterMyData),
      );
      if (filterMyData.length > 0) {
        const remove = route.params.data.pendingMessages.filter(
          data => data.receiver !== route.params.id,
        );
        firestore().collection('users').doc(route.params.data.name).update({
          pendingMessages: remove,
        });
      }
    }
    // Update messages where 'to' is equal to route.params.id
    firestore()
      .collection('chats')
      .doc('' + route.params.data.name + route.params.id)
      .collection('messages')
      .where('to', '==', route.params.id)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          // Update the document with the new 'isMessageScene' field
          firestore()
            .collection('chats')
            .doc('' + route.params.data.name + route.params.id)
            .collection('messages')
            .doc(doc.id)
            .update({
              isMessageScene: true, // Update the 'isMessageScene' field
            })
            .then(() => {
              console.log('Message marked as read');
            })
            .catch(error => {
              console.log('Error while updating message', error);
            });
        });
      });

    //update from myList
    // Update messages where 'to' is equal to route.params.id
    firestore()
      .collection('chats')
      .doc('' + route.params.id + route.params.data.name)
      .collection('messages')
      .where('to', '==', route.params.id)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          // Update the document with the new 'isMessageScene' field
          firestore()
            .collection('chats')
            .doc('' + route.params.id + route.params.data.name)
            .collection('messages')
            .doc(doc.id)
            .update({
              isMessageScene: true, // Update the 'isMessageScene' field
            })
            .then(() => {
              console.log('Message marked as read');
            })
            .catch(error => {
              console.log('Error while updating message', error);
            });
        });
      });
  };

  //get my personal inf0
  useEffect(() => {
    firestore()
      .collection('users')
      .onSnapshot(querySnapShot => {
        const allUsers = querySnapShot.docs.map(item => {
          return {...item.data()};
        });
        const filter = allUsers.filter(data => data.name == route.params.id);

        // setAllUsers(filter);
        setPersonalInfo(filter);
      });
  }, []);
  // get interacted person status
  useEffect(() => {
    async function getCurrentUserStatus() {
      const subscriber = firestore()
        .collection('users')
        .onSnapshot(querySnapShot => {
          const allUsers = querySnapShot.docs.map(item => {
            return {...item.data()};
          });
          const filter = allUsers.filter(
            data => data.name == route.params.data.name,
          );
          setIsPersonAvailable(filter[0].isLive);
          setIsCurrentPersonInteractingMe(filter[0].connectedPerson);
          setIsPersonTyping(filter[0].isTyping);
          setReceiverToken(filter[0].token);

          // setAllUsers(filter);
        });
    }
    getCurrentUserStatus();
    // async function getCurrentReceiver() {
    //   const user = firestore()
    //     .collection('users')
    //     .doc(route.params.data.name)
    //     .get()
    //     .then(data => {
    //       console.log('ugfuygfuyds', data.data().isLive);
    //       setIsPersonAvailable(data.data().isLive);
    //     });
    // }
    // getCurrentReceiver();

    // firestore()
    //   .collection('users')
    //   .where('name', '!=', userName)
    //   .get()
    //   .then(res => {
    //     console.log('========<<<<<>>>>>>>>>>>', res.docs[0].data());
    //     // setAllUsers(JSON.stringify(res.docs));
    //     if (res.docs.length !== 0) {
    //       const getData = res.docs.map(data => data.data());
    //       setAllUsers(getData);
    //     }
    //   })
    //   .catch(error => {
    //     console.log('===============>', error);
    //   });
  }, []);
  //disConnect person
  useEffect(() => {
    return () => {
      firestore()
        .collection('users')
        .doc(route.params.id)
        .update({
          connectedPerson: '',
        })
        .then(() => {})
        .catch(error => {});
    };
  }, []);

  // // useEffect(() => {
  // //   async function getCurrentMessages() {
  // const myname = await AsyncStorage.getItem('user');
  // setCurrentUser(myname);
  // // socket.emit('myFriendChat', {sender: myname, receiver: name});
  // //  }
  // //   getCurrentMessages();
  // //   interViewID = setInterval(() => {
  // //     socket.on('getAllChat', Msgs => {
  // //       console.log('receiver current value', Msgs);
  // //       setResult(Msgs);
  // //     });
  // //   }, 10);
  // //   return () => {
  // //     clearInterval(interViewID);
  // //   };
  // // }, [isFocus, socket]);

  const requestPermissions = async () => {
    try {
      const status = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);

      if (status === 'granted') {
        pickDocument();
      } else {
      }
    } catch (error) {}
  };

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
              <Entypo name="emoji-happy" size={30} color={colors.mainColor} />
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
              color={colors.mainColor}
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
                      item.from == route.params.id ? 'flex-end' : 'flex-start',
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
                          item.from == route.params.id
                            ? colors.mainColor
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
                    <Text
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
                    </Text>
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
        <Image
          source={{uri: route.params.data.image}}
          style={styles.receiverImage}
        />
        <View>
          <Text style={styles.receiverName}>{route.params.data.name}</Text>
          {isPersonTyping ? (
            <Text style={styles.receiverName}>typing...</Text>
          ) : (
            <Text style={styles.receiverName}>
              {isPersonAvailable ? 'Online' : 'offline'}
            </Text>
          )}
        </View>
      </View>
      {loading && (
        <ActivityIndicator
          size="large"
          color={colors.mainColor}
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
    marginBottom: 5,
    paddingHorizontal: 10,
    backgroundColor: '#F5F6E7',
  },
  messageTextContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.mainColor,
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
    backgroundColor: colors.mainColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  messageList: {
    flex: 1,
    paddingVertical: 3,
    backgroundColor: '#F5F6E7',
  },
  ReceiverProfileContainer: {
    // height: heightPercentageToDP(12),
    backgroundColor: colors.mainColor,
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
export default PrivateChat;
