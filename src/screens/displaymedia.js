import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import VideoPlayer from 'react-native-video-player';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import {colors} from '../constants/colors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Displaymedia = ({route}) => {
  const {video, image} = route.params;
  const navigation = useNavigation();
  const backToMessageRoom = () => {
    navigation.goBack();
  };
  return (
    <View style={styles.container}>
      <View style={styles.backController}>
        <MaterialIcons
          name="arrow-back"
          size={30}
          color={'white'}
          style={{width: widthPercentageToDP(10)}}
          onPress={() => backToMessageRoom()}
        />
      </View>
      <View style={{flex: 1}}>
        {video && (
          <VideoPlayer
            video={{
              uri: video,
            }}
            defaultMuted
            disableControlsAutoHide
            fullScreenOnLongPress
            autoplay={false}
            style={{
              height: '100%',
              width: '100%',
              resizeMode: 'cover',
              backgroundColor: 'black',
            }}
          />
        )}
        {image && (
          <Image
            source={{uri: image}}
            style={{
              height: '100%',
              width: '100%',
              resizeMode: 'contain',
            }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backController: {
    height: heightPercentageToDP(8),
    backgroundColor: colors.mainColor,
    paddingHorizontal: 7,
    justifyContent: 'center',
  },
});
export default Displaymedia;
