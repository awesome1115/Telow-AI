import React, { FC, useEffect, useState } from 'react';
import {
  Box,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import Stripe from 'stripe';
import { useAuthorizer } from '@authorizerdev/authorizer-react';
import moment from 'moment';

interface SubscriptionDetailsProps {}

const SubscriptionDetails: FC<SubscriptionDetailsProps> = () => {
  const [subscriptions, setSubscriptions] =
    useState<Stripe.ApiList<Stripe.Subscription> | null>(null);
  const { user } = useAuthorizer();
  const [stripe] = useState(() => {
    if (import.meta.env.VITE_STRIPE_SECRET_KEY) {
      return new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {
        apiVersion: '2023-08-16',
      });
    }
    return null;
  });

  const subscriptionsForUser = async (
    customerId: string
  ): Promise<Stripe.ApiList<Stripe.Subscription>> => {
    try {
      return await stripe!.subscriptions.list({
        customer: customerId,
      });
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error; // Rethrow the error after logging it
    }
  };

  useEffect(() => {
    const getSubscriptionList = async () => {
      if (!user?.email) return;

      const checkStripeUser = await stripe?.customers.list({
        email: user?.email,
      });
      if (checkStripeUser) {
        try {
          setSubscriptions(
            await subscriptionsForUser(checkStripeUser?.data[0]?.id as string)
          );
        } catch (error) {
          console.error(error);
        }
      }
    };
    getSubscriptionList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const formatCurrency = (amount: number): string => {
    const amountInDollars = amount / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amountInDollars);
  };

  return (
    <Box>
      <Text as="b">Subscriptions</Text>
      <TableContainer mt={5}>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Domain</Th>
              <Th>Created At</Th>
              <Th isNumeric>Charges</Th>
            </Tr>
          </Thead>
          <Tbody>
            {subscriptions &&
              subscriptions?.data.map((subscription: Stripe.Subscription) => {
                const firstItem = subscription.items.data[0];
                const amount = firstItem.price.unit_amount;

                return (
                  <Tr key={subscription.id}>
                    <Td>{subscription.metadata.domain}</Td>
                    <Td>
                      {moment.unix(subscription.created).format('MMMM Do YYYY')}
                    </Td>
                    <Td isNumeric>
                      {amount ? formatCurrency(amount) : 'N/A'} / Month
                    </Td>
                  </Tr>
                );
              })}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SubscriptionDetails;
