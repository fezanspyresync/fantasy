const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const stripe = require('stripe')(
  'sk_test_51NfKeDEIANEVTCSvfoCHcTdq4qRplJIUHnY6bQO65a1blVigIJLq1VbIZOFlyD0zPSQlXWjGGo6dhjIUXqGa7gxD00TewmIMf0',
);
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('accept offer');
});

app.post('/payment-sheet', async (req, res) => {
  try {
    // Use an existing Customer ID if this is a returning customer.
    const {amount, currency, token} = req.body;
    const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
      {customer: customer.id},
      {apiVersion: '2022-11-15'},
    );

    console.log('body======>', customer.id, token);

    const customerId = customer?.id;

    //associate card with customer
    const customeSource = await stripe.customers.createSource(customerId, {
      source: token,
    });
    console.log('Customer Source=====>', customeSource);
    //payment
    const paymentIntent = await stripe.charges.create({
      amount: amount,
      currency: currency,
      customer: customer.id,
      card: customeSource.id,
    });

    console.log('Payment Intent========>', paymentIntent);

    // if (paymentIntent) {
    //   //   res.status(200).json(paymentIntent);
    // }

    res.status(200).json('payment successfull');
  } catch (error) {
    console.log('error', error);
    res.status(400).json(error);
  }
});

app.listen(4000, () => {
  console.log('server is running');
});
