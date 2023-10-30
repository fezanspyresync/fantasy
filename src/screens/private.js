import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import {socket} from '../..';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import Toast from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';

let id = '';
const Private = () => {
  const [allUsers, setAllUsers] = useState([]);
  const isFocus = useIsFocused();
  const navigation = useNavigation();
  useEffect(() => {
    // async function currentUser() {
    //   // const user = await AsyncStorage.getItem('user');
    //   // socket.emit('currentUser', {user});
    // }
    // currentUser();
    getAllUsers();
  }, [isFocus]);

  const getAllUsers = async () => {
    const userName = await AsyncStorage.getItem('user');
    id = userName;
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

    const subscriber = firestore()
      .collection('users')
      .onSnapshot(querySnapShot => {
        const allUsers = querySnapShot.docs.map(item => {
          return {...item.data()};
        });
        const filter = allUsers.filter(data => data.name !== userName);

        setAllUsers(filter);
      });
  };

  // socket.on('getAllUsers', allRegisterUsers => {
  //   setAllUsers(allRegisterUsers);
  // });

  //navigate to interActed Person
  const PrivateChat = receiverdata => {
    firestore()
      .collection('users')
      .doc(receiverdata.id)
      .update({
        connectedPerson: receiverdata.data.name,
      })
      .then(() => {
        console.log('interAction has been done');
      })
      .catch(error => {
        console.log('error while interAction');
      });
    navigation.navigate('privateChat', receiverdata);
  };

  useEffect(() => {
    const handleOnline = async () => {
      console.log('activeeeeeeeeeeeeeeee');
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
          })
          .catch(error => {
            console.log('error while online');
          });
      }
    };
    handleOnline();
  }, [isFocus]);
  return (
    <View style={styles.container}>
      {allUsers.length > 0 && (
        <FlatList
          data={allUsers}
          renderItem={({item}) => {
            return (
              <TouchableOpacity
                onPress={() =>
                  PrivateChat({
                    data: item,
                    id: id,
                  })
                }
                style={styles.user}>
                <View
                  style={[
                    styles.profilePic,
                    {borderColor: item.isLive ? 'green' : 'red'},
                  ]}>
                  <Image
                    style={styles.pic}
                    source={{
                      uri: `${item.image}`,
                    }}
                  />
                </View>
                <View style={{flex: 1}}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userInfoColor}>{item.name}</Text>

                    {item?.pendingMessages?.filter(data => data.receiver == id)
                      .length > 0 && (
                      <View
                        style={{
                          backgroundColor: 'blue',
                          marginRight: 5,
                          borderWidth: 1,
                          borderRadius: 20,
                          alignSelf: 'center',
                          justifyContent: 'center',
                          alignItems: 'center',
                          padding: 1,
                          minHeight: 30,
                          minWidth: 30,
                        }}>
                        <Text style={{color: 'white'}}>
                          {
                            item?.pendingMessages?.filter(
                              data => data.receiver == id,
                            )[0]?.totalMessages
                          }
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={{
                      marginLeft: 10,
                      bottom: 10,
                      // backgroundColor: 'blue',
                      color: item.isLive ? 'green' : 'red',
                    }}>
                    {item.isLive ? 'online' : 'offline'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item, index) => item.name}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6E7 ',
  },
  user: {
    flexDirection: 'row',
    marginVertical: heightPercentageToDP(2),
    marginHorizontal: widthPercentageToDP(2),
    // backgroundColor: 'blue',
  },
  profilePic: {
    height: heightPercentageToDP(8),
    width: widthPercentageToDP(16),
    borderRadius: 50,
    // backgroundColor: 'red',
    borderWidth: 2,
    // padding: 3,
    overflow: 'hidden',
  },
  pic: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  userInfo: {
    paddingTop: heightPercentageToDP(1),
    marginLeft: widthPercentageToDP(2),
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    // alignSelf: 'flex-start',
    // alignSelf: 'flex-start',
    // backgroundColor: 'red',
    flex: 1,
    // backgroundColor: 'blue',
  },
  userInfoColor: {
    color: '#000',
  },
});

export default Private;
