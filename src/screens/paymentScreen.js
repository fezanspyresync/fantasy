import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {SP_KEY} from '@env';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {colors} from '../constants/colors';

const PaymentScreen = ({route}) => {
  console.log('========Route====>', typeof route.params.price[0]);
  const navigation = useNavigation();
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    expMonth: '',
    cvc: '',
  });

  const handleCardNumberChange = text => {
    // Limit the card number to 16 digits
    if (text.length <= 16) {
      setCardInfo(prev => ({...prev, cardNumber: text}));
    }
  };

  const handleExpMonthChange = text => {
    // Remove any non-numeric characters
    text = text.replace(/\D/g, '');

    // Limit the expiration month to 4 characters (MM/YY)
    if (text.length > 2) {
      // If the input is longer than 2 characters, automatically add a forward slash
      text = text.slice(0, 2) + '/' + text.slice(2);
    }

    // Limit the input to 5 characters (MM/YY)
    if (text.length <= 5) {
      setCardInfo(prev => ({...prev, expMonth: text}));
    }
  };

  const handleCvcChange = text => {
    // Limit the CVC to 3 digits
    if (text.length <= 3) {
      setCardInfo(prev => ({...prev, cvc: text}));
    }
  };
  //
  const handlePayment = async () => {
    if (
      cardInfo.cardNumber == '' ||
      cardInfo.cvc == '' ||
      cardInfo.expMonth == '' ||
      cardInfo.cardNumber < 16 ||
      cardInfo.cvc < 3 ||
      cardInfo.expMonth < 5
    ) {
      Toast.show({
        type: 'error',
        text1: 'message',
        text2: 'Please enter correct information',
      });
      return;
    }
    try {
      const res = await axios.post(
        'https://api.stripe.com/v1/tokens',
        {
          'card[number]': cardInfo.cardNumber,
          'card[exp_month]': cardInfo.expMonth.split('/')[0],
          'card[exp_year]': cardInfo.expMonth.split('/')[1],
          'card[cvc]': cardInfo.cvc,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${SP_KEY}`,
          },
        },
      );
      const token = res.data.id;
      console.log(token);
      if (token) {
        Toast.show({
          type: 'info',
          text1: 'Success',
          text2: 'Payment has been received',
        });
        navigation.navigate('videcall');
      }
      // try {
      //   const response = await axios.post(
      //     'http://192.168.18.238:4000/payment-sheet',
      //     {amount: Number(route.params.price[0]), currency: 'eur', token},
      //   );
      //   console.log('is intent created', response.status);
      //   if (response.status == 200) {
      //     Toast.show({
      //       type: 'info',
      //       text1: 'Success',
      //       text2: 'Payment has been received',
      //     });
      //     navigation.navigate('videcall');
      //   } else if (response.status == 400) {
      //     navigation.navigate('videcall');
      //   }
      // } catch (error) {
      //   console.log(error);
      //   Toast.show({
      //     type: 'error',
      //     text1: 'message',
      //     text2: error,
      //   });
      //   navigation.navigate('videcall');
      // }

      //   // Create a charge using the token
      //   const chargeResponse = await axios.post(
      //     'https://api.stripe.com/v1/charges',
      //     {
      //       amount: 50000, // $500 in cents (Stripe uses cents)
      //       currency: 'usd',
      //       source: token, // Use the token as the payment source
      //     },
      //     {
      //       headers: {
      //         'Content-Type': 'application/x-www-form-urlencoded',
      //         Authorization: `Bearer ${SP_KEY}`,
      //       },
      //     },
      //   );
      //   console.log('Payment Successful:', chargeResponse.data);
    } catch (error) {
      console.error('Error creating token:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text
        style={{
          textAlign: 'center',
          paddingBottom: 20,
          color: colors.girlsRoomColor,
          fontSize: 24,
        }}>
        Pay with Stripe
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Card Number"
        keyboardType="numeric"
        onChangeText={handleCardNumberChange}
        value={cardInfo.cardNumber}
        maxLength={16} // Maximum card number length
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="MM/YY"
          keyboardType="numeric"
          onChangeText={handleExpMonthChange}
          value={cardInfo.expMonth}
          maxLength={5} // Maximum expiration month length
        />
        <TextInput
          style={styles.input}
          placeholder="CVC"
          keyboardType="numeric"
          onChangeText={handleCvcChange}
          value={cardInfo.cvc}
          maxLength={3} // Maximum CVC length
        />
      </View>
      <TouchableOpacity onPress={handlePayment} style={styles.button}>
        <Text style={styles.buttonText}>Pay</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#F5F6E7',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    height: 40,
    // width: 200,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PaymentScreen;
