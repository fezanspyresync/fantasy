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
} from 'react-native';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
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
import {socket} from '../..';
import {Immersive} from 'react-native-immersive';

import VideoPlayer from 'react-native-video-player';
import Modal from 'react-native-modal';
import Feather from 'react-native-vector-icons/Feather';
import firestore, {firebase} from '@react-native-firebase/firestore';
import {PERMISSIONS, request} from 'react-native-permissions';
import DocumentPicker from 'react-native-document-picker';
import RNFetchBlob from 'react-native-fetch-blob';
import storage from '@react-native-firebase/storage';

const PrivateChat = () => {
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
  const [isCurrentPersonInteractingMe, setIsCurrentPersonInteractingMe] =
    useState('');
  const [isPersonTyping, setIsPersonTyping] = useState('');
  let typingTimeout;

  const messageHandler = msg => {
    if (isCurrentPersonInteractingMe == route.params.id) {
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
      firestore().collection('users').doc(route.params.id).update({
        isTyping: false,
      });
    }
    setMessage(msg);
  };

  console.log('ysagdysadysafd', isPersonTyping);

  const messageSubmitHandler = async (image = '', video = '') => {
    // const user = await AsyncStorage.getItem('user');

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
          isCurrentPersonInteractingMe == route.params.id ? true : false,
      };

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
  }, []);

  //seenMessageHandler
  const seenMessageHandler = item => {
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
          console.log('doccccccccccccccccccccc', doc.id);
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

  //update interaction
  useEffect(() => {}, []);
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
          // Handle video upload
          const path = result[0].uri;

          const res = await RNFetchBlob.fs.readFile(path, 'base64');
          const blobData = `data:${mimeType};base64,${res}`;

          const filename =
            new Date().getTime() + `.${mimeType.replace('video/', '')}`;
          const reference = storage().ref(filename);

          await reference.putString(blobData, 'data_url');

          const videoUrl = await storage().ref(filename).getDownloadURL();

          // setVideo(videoUrl);
          messageSubmitHandler(undefined, videoUrl);

          // You can do further processing or set the video URL as needed
        } else if (mimeType.startsWith('image/')) {
          // Handle video upload
          const path = result[0].uri;

          const res = await RNFetchBlob.fs.readFile(path, 'base64');
          const blobData = `data:${mimeType};base64,${res}`;

          const filename =
            new Date().getTime() + `.${mimeType.replace('image/', '')}`;
          const reference = storage().ref(filename);

          await reference.putString(blobData, 'data_url');

          const ImageUrl = await storage().ref(filename).getDownloadURL();

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
      <View style={styles.messsageOverAllContainer}>
        <View style={styles.messageTextContainer}>
          <Entypo name="emoji-happy" size={30} color={colors.mainColor} />
          <TextInput
            value={message}
            onChangeText={messageHandler}
            placeholder="Message"
            placeholderTextColor="#0000"
            style={styles.input}
            multiline
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
          onPress={() => messageSubmitHandler()}>
          {message == '' && (
            <MaterialIcons name="send" size={30} color={'white'} />
          )}
        </TouchableOpacity>
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
                    onPress={() => {
                      toggleFullscreen;
                    }}
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
                      <Text style={{color: 'white'}}>{item.message}</Text>
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
                      }}>
                      {item.mesageSendTime}
                    </Text>
                    <Text
                      style={{textAlign: 'right', fontSize: 12, color: '#000'}}>
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
