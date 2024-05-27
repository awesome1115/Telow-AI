import React, { FC, useEffect, useState } from 'react';
import { Box, Divider, Grid, GridItem } from '@chakra-ui/react';
import Stripe from 'stripe';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuthorizer } from '@authorizerdev/authorizer-react';
import CheckoutForm from './CheckoutForm/CheckoutForm';
import PaymentMethods from './PaymentMethods/PaymentMethods';
import AccountBalance from './AccountBalance/AccountBalance';
import SubscriptionDetails from './SubscriptionDetails/SubscriptionDetails';

interface BillingProps {}

const Billing: FC<BillingProps> = () => {
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  const [clientSecret, setClientSecret] = useState('');
  const [stripeCustomer, setStripeCustomer] = useState<Stripe.Customer>();
  const [stripe] = useState(() => {
    if (import.meta.env.VITE_STRIPE_SECRET_KEY) {
      return new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {
        apiVersion: '2023-08-16',
      });
    }
    return null;
  });
  const { user } = useAuthorizer();

  useEffect(() => {
    const createPaymentSetupGetBalance = async () => {
      if (!stripePromise || !user?.email) return;

      const checkStripeUser = await stripe?.customers.list({
        email: user?.email,
      });
      if (checkStripeUser) {
        setStripeCustomer(checkStripeUser?.data[0]);
        try {
          const setuptIntent = await stripe?.setupIntents.create({
            customer: checkStripeUser?.data[0]?.id,
            automatic_payment_methods: { enabled: true },
          });
          if (setuptIntent) {
            setClientSecret(setuptIntent.client_secret as string);
          }
        } catch (error) {
          console.log(error);
        }
      }
    };
    createPaymentSetupGetBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  return (
    <Grid templateColumns="repeat(12, 1fr)" mt={5} gap={5} px={5}>
      <GridItem colSpan={{ base: 12, md: 5 }}>
        <Box>
          {stripePromise && clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm />
            </Elements>
          )}
        </Box>
      </GridItem>
      <GridItem colSpan={{ base: 12, md: 4 }}>
        <Box>
          <AccountBalance customer={stripeCustomer} />
          <Divider my={6} />
          <PaymentMethods />
        </Box>
      </GridItem>
      <GridItem colSpan={{ base: 12, md: 9 }}>
        <Divider my={9} />
        <Box>
          <SubscriptionDetails />
        </Box>
        <Divider my={9} />
      </GridItem>
    </Grid>
  );
};

export default Billing;
