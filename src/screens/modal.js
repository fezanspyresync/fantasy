import Modal from 'react-native-modal';
import {View, Text} from 'react-native';
import React from 'react';

const Modal = ({isModalVisible = false}) => {
  return (
    <Modal isVisible={isModalVisible}>
      <View style={{flex: 1}}>
        <Text>Hello!</Text>

        <Button title="Hide modal" onPress={toggleModal} />
      </View>
    </Modal>
  );
};

export default modalM;
