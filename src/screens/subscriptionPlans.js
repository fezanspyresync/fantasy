import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import React from 'react';
import {FlatList} from 'react-native-gesture-handler';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import {colors} from '../constants/colors';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';

const SubscriptionPlans = () => {
  const navigation = useNavigation();
  const paymentScreen = data => {
    const digits = data.match(/\d+/);
    console.log(digits[0]);
    navigation.navigate('payment', {price: digits});
  };
  return (
    <View style={styles.contain}>
      <FlatList
        data={[
          {
            price: '2000 cents',
            name: '1 month plan',
            icon: <FontAwesome5 name="kiwi-bird" size={45} color="white" />,
          },
          {
            price: '5000 cents',
            name: '6 month plan',
            icon: (
              <FontAwesome6
                name="spaghetti-monster-flying"
                size={45}
                color="white"
              />
            ),
          },
          {
            price: '8000 cents',
            name: '1 year plan',
            icon: (
              <MaterialCommunityIcons name="bird" size={45} color="white" />
            ),
          },
        ]}
        renderItem={({item}) => {
          return (
            <TouchableOpacity
              onPress={() => paymentScreen(item.price)}
              style={{
                width: widthPercentageToDP(90),
                backgroundColor: colors.girlsRoomColor,
                alignItems: 'center',
                paddingVertical: 15,
                borderRadius: 10,
                marginTop: 20,
              }}>
              <View
                style={{
                  height: 100,
                  width: 100,
                  borderRadius: 50,
                  borderWidth: 2,
                  overflow: 'hidden',
                  backgroundColor: 'red',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {item.icon}
              </View>
              <TouchableOpacity
                style={{marginVertical: 30}}
                onPress={() => Alert.alert('live call')}>
                <Text style={{color: 'white', fontSize: 18}}>{item.name}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Alert.alert('live call')}>
                <Text style={{color: 'white', fontSize: 18}}>{item.price}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  contain: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default SubscriptionPlans;
