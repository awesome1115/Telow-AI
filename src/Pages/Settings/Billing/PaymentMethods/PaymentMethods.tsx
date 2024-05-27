import React, { FC, useEffect, useState } from 'react';
import Stripe from 'stripe';
import { PaymentMethod } from '@stripe/stripe-js';
import {
  Box,
  Card,
  CardBody,
  Flex,
  Heading,
  Text,
  Button,
  useToast,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { BsCreditCard2Back } from 'react-icons/bs';
import { MdDeleteOutline } from 'react-icons/md';
import { useAuthorizer } from '@authorizerdev/authorizer-react';

const PaymentMethods: FC = () => {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [paymentMethodList, setPaymentMethodList] = useState<PaymentMethod[]>(
    []
  );
  const [methodRemoveRequest, setMethodRemoveRequest] = useState<unknown>();
  const [stripeCustomer, setStripeCustomer] = useState<Stripe.Customer | null>(
    null
  );
  const toast = useToast();
  const { user } = useAuthorizer();
  const [activeModalId, setActiveModalId] = useState<string | null>(null);

  useEffect(() => {
    if (
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY &&
      import.meta.env.VITE_STRIPE_SECRET_KEY
    ) {
      setStripe(
        new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {
          apiVersion: '2023-08-16',
        })
      );
    }
  }, [methodRemoveRequest]);

  useEffect(() => {
    const getpaymentMethodList = async () => {
      if (stripe && user?.email) {
        const checkStripeUser = await stripe.customers.list({
          email: user.email,
        });
        const customerId = checkStripeUser.data[0]?.id;
        if (customerId) {
          try {
            const paymentMethods = await stripe.paymentMethods.list({
              customer: customerId,
              type: 'card', // Assuming card type for this example
            });

            setPaymentMethodList(paymentMethods.data as PaymentMethod[]);

            const sCustomer = await stripe.customers.retrieve(customerId);
            setStripeCustomer(sCustomer as Stripe.Customer);
          } catch (error) {
            console.error(error);
          }
        }
      }
    };
    getpaymentMethodList();
  }, [stripe, user, methodRemoveRequest]);

  const setDefaultPayment = async (id: string) => {
    if (stripe && user?.email) {
      const checkStripeUser = await stripe.customers.list({
        email: user.email,
      });
      const customerId = checkStripeUser.data[0]?.id;
      if (customerId) {
        try {
          await stripe.customers.update(customerId, {
            invoice_settings: {
              default_payment_method: id,
            },
          });
          toast({
            title: 'Default Payment Changed.',
            status: 'success',
            duration: 9000,
            isClosable: true,
          });
          setMethodRemoveRequest({});
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  const deAttachedPaymentMethod = async (id: string) => {
    if (stripe) {
      await stripe.paymentMethods.detach(id);
      setMethodRemoveRequest({});
      toast({
        title: 'Payment Method Removed.',
        status: 'success',
        duration: 9000,
        isClosable: true,
      });
      setActiveModalId(null); // Close the modal
    }
  };

  return (
    <Box pl={{ base: 0, md: 6 }}>
      <Heading size="sm">Active Payments</Heading>
      <small>Default payment is required on account to create instances.</small>
      {paymentMethodList.length > 0 ? (
        <Box mt={4}>
          {paymentMethodList.map((method) => (
            <Card
              key={method.id}
              mb={3}
              style={{
                backgroundColor:
                  stripeCustomer?.invoice_settings.default_payment_method ===
                  method.id
                    ? '#A1FE01'
                    : 'white',
              }}
            >
              <CardBody>
                <Flex alignItems="center" justifyContent="space-between">
                  <Box>
                    <Flex alignItems="center">
                      <Box mr={4}>
                        <BsCreditCard2Back />
                      </Box>
                      <Text fontWeight="bold" textTransform="uppercase">
                        {method.card?.brand}
                      </Text>{' '}
                      /
                      <Text ml={3} fontFamily="monospace">
                        xxxx {method.card?.last4}
                      </Text>
                    </Flex>
                  </Box>
                  <Button onClick={() => setActiveModalId(method.id)}>
                    <MdDeleteOutline />
                  </Button>
                  <Modal
                    isOpen={activeModalId === method.id}
                    onClose={() => setActiveModalId(null)}
                  >
                    <ModalOverlay />
                    <ModalContent>
                      <ModalHeader>Confirm</ModalHeader>
                      <ModalCloseButton />
                      <ModalBody>
                        <Text>Are you sure you want to delete this card?</Text>
                      </ModalBody>
                      <ModalFooter>
                        <Button
                          size="sm"
                          mr={3}
                          onClick={() => setActiveModalId(null)}
                        >
                          Close
                        </Button>
                        <Button
                          colorScheme="red"
                          size="sm"
                          onClick={() => deAttachedPaymentMethod(method.id)}
                        >
                          Delete
                        </Button>
                      </ModalFooter>
                    </ModalContent>
                  </Modal>
                  {stripeCustomer?.invoice_settings.default_payment_method !==
                    method.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDefaultPayment(method.id)}
                    >
                      Make Default
                    </Button>
                  )}
                </Flex>
              </CardBody>
            </Card>
          ))}
        </Box>
      ) : (
        <Text>No payment method attached to your account.</Text>
      )}
    </Box>
  );
};

export default PaymentMethods;
