import React, { FC, FormEventHandler, useEffect, useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button, useToast } from '@chakra-ui/react';
import Stripe from 'stripe';
import { useAuthorizer } from '@authorizerdev/authorizer-react';

interface CheckoutFormProps {}

const CheckoutForm: FC<CheckoutFormProps> = () => {
  const stripe = useStripe();
  const [lStripe, setLStripe] = useState<Stripe>();
  const elements = useElements();
  const [message] = useState<string>();
  const [isProcessing, setIsProcessing] = useState<boolean>();
  const toast = useToast();
  const { user } = useAuthorizer();

  useEffect(() => {
    if (
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY &&
      import.meta.env.VITE_STRIPE_SECRET_KEY
    ) {
      setLStripe(
        new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {
          apiVersion: '2023-08-16',
        })
      );
    }
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    await stripe
      .confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}${window.location.pathname}`,
        },
        redirect: 'if_required',
      })
      .then(async (result) => {
        const checkStripeUser = await lStripe?.customers.list({
          email: user?.email,
        });
        try {
          await lStripe!.customers
            .update(checkStripeUser?.data[0]?.id as string, {
              invoice_settings: {
                default_payment_method: result.setupIntent
                  ?.payment_method as string,
              },
            })
            .then((data: Stripe.Response<Stripe.Customer>) => {
              if (data) {
                window.location.reload();
                toast({
                  title: 'Default Payment Method Changed.',
                  status: 'success',
                  duration: 9000,
                  isClosable: true,
                });
              }
            });
        } catch (error: unknown) {
          console.log(error);
        }
        setIsProcessing(false);
      })
      .catch((error) => {
        toast({
          title: 'Payment Failed',
          description: error.message,
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
        setIsProcessing(false);
        setIsProcessing(false);
      });
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <Button
        disabled={isProcessing || !stripe || !elements}
        mt={4}
        id="submit"
        backgroundColor="#A1FE01"
        isLoading={isProcessing}
        type="submit"
      >
        {isProcessing ? 'Processing ... ' : 'Add Payment Method'}
      </Button>
      {/* Show any error or success messages */}
      {message && <div id="payment-message">{message}</div>}
    </form>
  );
};

export default CheckoutForm;
