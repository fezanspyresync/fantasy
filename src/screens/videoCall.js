import {View, Text, StyleSheet} from 'react-native';
import React from 'react';

const VideoCall = () => {
  return (
    <View style={styles.container}>
      <Text style={{color: '#000'}}>this feature will be available soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoCall;
