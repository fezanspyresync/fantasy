import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';

const VideoCall = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={{color: '#000', fontSize: 24}}>
        this feature will be available soon
      </Text>
      <TouchableOpacity
        onPress={() => navigation.replace('home')}
        style={{
          paddingVertical: 10,
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'gray',
          width: widthPercentageToDP(80),
          marginTop: 10,
        }}>
        <Text style={{color: '#000', fontSize: 24}}>Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F6E7',
  },
});

export default VideoCall;
