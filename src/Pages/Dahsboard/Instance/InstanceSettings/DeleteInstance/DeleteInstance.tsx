import { FC, useEffect, useState } from 'react';
import { Box, Button, useToast, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import Stripe from 'stripe';
import {
  UpdateInstanceStatusQuery,
  GetInstancesQuery,
} from '../../../../../API/GraphQL/InstancesGraphQL';
import useActiveInstanceStore from '../../../../../States/instancesStore';

interface DeleteInstanceProps {}

const DeleteInstance: FC<DeleteInstanceProps> = () => {
  const activeInstance = useActiveInstanceStore((state) => state.instance);
  const [stripe, setStripe] = useState<Stripe>();
  const [updateInstance] = useMutation(UpdateInstanceStatusQuery);
  const toast = useToast();
  const route = useNavigate();

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
  }, []);

  const onDeleteInstance = async () => {
    if (stripe) {
      await stripe.subscriptions
        .cancel(activeInstance!.subscription_id, {
          prorate: true,
        })
        .then((data: Stripe.Subscription) => {
          if (data) {
            updateInstance({
              variables: {
                id: activeInstance!.id,
                status: 'inactive',
              },
              onCompleted(subscription) {
                if (subscription) {
                  toast({
                    title: 'Instance Removed',
                    description:
                      'You have successfully cancel subscription to your instance.',
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                  });
                  route('/');
                }
              },
              onError(error) {
                console.error(error);
              },
              refetchQueries: [
                {
                  query: GetInstancesQuery,
                },
              ],
            });
          }
        });
    }
  };

  return (
    <>
      <Text color="gray.400" as="b">
        Delete Instance
      </Text>
      <Text color="gray.400">
        Once your instance is cancelled, it will not be available to view.
      </Text>
      <Box py="15px">
        <Button colorScheme="red" py="20px" onClick={onDeleteInstance}>
          Cancel Subscription
        </Button>
      </Box>
    </>
  );
};

export default DeleteInstance;
