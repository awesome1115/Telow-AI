import { Box, Card, CardBody, Flex, Heading, Text } from '@chakra-ui/react';
import React, { FC } from 'react';
import Stripe from 'stripe';

interface AccountBalanceProps {
  customer?: Stripe.Customer;
}

export const formatCurrency = (amount: number): string => {
  const amountInDollars = amount / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountInDollars);
};

const AccountBalance: FC<AccountBalanceProps> = ({ customer }) => {
  const balanceInDollars = customer?.balance ? customer!.balance / 100 : 0;
  const isCredit = balanceInDollars < 0;
  const balanceColor = isCredit ? 'green.400' : 'black'; // Chakra-UI color scheme

  return (
    <Box pl={{ base: 0, md: 6 }}>
      <Heading size="sm">Account Balance</Heading>
      <Box mt={4}>
        <Card
          mb={3}
          style={{
            backgroundColor: customer?.delinquent ? '#ffa9a9' : 'white',
          }}
        >
          <CardBody>
            <Flex alignItems="center" justifyContent="space-between">
              <Box>
                <Flex alignItems="center">
                  <Text
                    fontWeight={800}
                    textTransform="uppercase"
                    color={balanceColor}
                  >
                    {formatCurrency(Number(customer?.balance))}{' '}
                    {customer?.delinquent && 'Past Due'}
                  </Text>
                </Flex>
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
};

export default AccountBalance;
