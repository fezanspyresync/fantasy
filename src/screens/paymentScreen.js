import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {StripeProvider, createToken} from '@stripe/stripe-react-native';
import {SP_KEY} from '@env';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';

const PaymentScreen = () => {
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
    // Limit the expiration month to 2 digits
    if (cardInfo.expMonth.length == 2) {
      const value = cardInfo.expMonth + '/';
      console.log('sfuygsyfugsydufgdsuyg', value);
      setCardInfo({...cardInfo, expMonth: value});
    }
    setCardInfo(prev => ({...prev, expMonth: text}));
  };

  const handleCvcChange = text => {
    // Limit the CVC to 3 digits
    if (text.length <= 3) {
      setCardInfo(prev => ({...prev, cvc: text}));
    }
  };
  //
  console.log(cardInfo.expMonth);
  const handlePayment = async () => {
    try {
      const res = await axios.post(
        'https://api.stripe.com/v1/tokens',
        {
          'card[number]': cardInfo.cardNumber,
          'card[exp_month]': cardInfo.expMonth,
          'card[exp_year]': cardInfo.expYear,
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
      try {
        const response = await axios.post(
          'http://192.168.39.129:4000/payment-sheet',
          {amount: 10000000, currency: 'eur', token},
        );
        console.log('is intent created', response);
        navigation.navigate('videocall');
      } catch (error) {
        console.log(error);
      }

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
