import { FC, useEffect, useState } from 'react';
import './Dashboard.scss';
import {
  Grid,
  GridItem,
  Heading,
  Divider,
  useToast,
  Box,
  Text,
} from '@chakra-ui/react';
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useAuthorizer } from '@authorizerdev/authorizer-react';
import Stripe from 'stripe';
import { ApolloError, useMutation } from '@apollo/client';
import Lottie from 'lottie-react';
import { User } from '@authorizerdev/authorizer-js';
import RobotSwing from '@assets/lotties/robot-swing.json';
import Rocket from '@assets/lotties/Rocket.json';
import Header from '../../Shared/Header/Header';
import AddInstance from './AddInstance/AddInstance';
import { useGetInstances } from '../../API/Hooks/InstancesHook';
import { Instances } from '../../API/Model/InstancesModel';
import useActiveInstanceStore from '../../States/instancesStore';
import {
  GetUserOptionsQuery,
  CreateUserOptionsWithStripeIdQuery,
} from '../../API/GraphQL/UserOptionsGraphQL';
import Instance from './Instance/Instance';
import InstanceSettings from './Instance/InstanceSettings/InstanceSettings';
import Connects from './Instance/Connects/Connects';
import Chat from './Instance/Chat/Chat';
import InstanceCard from './InstanceCard/InstanceCard';
import SideNav from '../../Shared/SideNav/SideNav';

interface DashboardProps {}

const Dashboard: FC<DashboardProps> = () => {
  const { user } = useAuthorizer();
  const instances = useGetInstances();
  const addActiveInstance = useActiveInstanceStore(
    (state) => state.addInstance
  );
  const [updateUserOptionsStripeID] = useMutation(
    CreateUserOptionsWithStripeIdQuery
  );
  const [, setStripe] = useState<Stripe | null>(null);
  const [delinquent, setDelinquent] = useState<boolean>(false);
  const toast = useToast();
  const navigate = useNavigate();
  const [, setSelectedInstanceId] = useState<string>('');
  const [selectedInstance, setSelectedInstance] = useState<
    Instances | undefined
  >(undefined);
  const { id: instanceIdFromUrl } = useParams<{ id: string }>();

  useEffect(() => {
    const createStripeCustomer = async (
      user_data: User,
      stripeInstance: Stripe
    ) => {
      try {
        const params: Stripe.CustomerCreateParams = {
          metadata: {
            user_id: user_data!.id,
            phone: user_data!.phone_number as string,
            user_method: user_data!.signup_methods,
          },
          name: `${user_data!.given_name} ${user_data.family_name}`,
          email: user_data.email,
        };

        const createdCustomer = await stripeInstance.customers.create(params);
        if (createdCustomer) {
          updateUserOptionsStripeID({
            variables: {
              stripeId: createdCustomer.id,
              user_id: user!.id,
            },
            onCompleted() {
              toast({
                title: 'Welcome to Telow!',
                status: 'success',
                duration: 9000,
                isClosable: true,
              });
            },
            onError(error: ApolloError) {
              console.error(error);
            },
            refetchQueries: [{ query: GetUserOptionsQuery }],
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    const initializeStripeCustomer = async (
      user_data: User,
      stripeInstance: Stripe
    ) => {
      try {
        const list = await stripeInstance.customers.list({
          email: user_data!.email,
        });
        if (list.data.length === 0) {
          createStripeCustomer(user_data, stripeInstance);
        } else {
          setDelinquent(list.data[0].delinquent as boolean);
        }
      } catch (error) {
        console.error(error);
      }
    };
    if (user && import.meta.env.VITE_STRIPE_SECRET_KEY) {
      const stripeInstance = new Stripe(
        import.meta.env.VITE_STRIPE_SECRET_KEY,
        {
          apiVersion: '2023-08-16',
        }
      );
      setStripe(stripeInstance);
      initializeStripeCustomer(user, stripeInstance);
    }
  }, [toast, updateUserOptionsStripeID, user]);

  useEffect(() => {
    if (instances) {
      if (instanceIdFromUrl) {
        const instanceToSelect = instances.find(
          (instance) => instance.id === instanceIdFromUrl
        );
        setSelectedInstance(instanceToSelect);
        if (instanceToSelect) {
          setSelectedInstanceId(instanceToSelect.id);
          addActiveInstance(instanceToSelect);
        }
      } else if (instances.length > 0) {
        const firstInstanceId = instances[0].id;
        setSelectedInstanceId(firstInstanceId);
        addActiveInstance(instances[0]);
        navigate(`instance/${firstInstanceId}/chat`, { replace: true });
      }
    }
  }, [instances, instanceIdFromUrl, addActiveInstance, navigate]);

  return (
    <SideNav>
      <Box
        fontWeight={500}
        bg="white"
        m={7}
        ml={0}
        position="absolute"
        height="96%"
        overflow="hidden"
        borderRadius={20}
      >
        <Header title="Dashboard | Telow" />

        {!delinquent ? (
          <Grid
            templateColumns="repeat(24, 1fr)"
            templateRows={{ base: '0fr', md: '1fr' }}
            p={6}
          >
            <GridItem colSpan={{ base: 24, md: 6 }} className="Instances">
              <Box pt={5} px={3}>
                <AddInstance />
              </Box>
              <GridItem colSpan={{ base: 6 }} className="Instances">
                {instances && instances.length > 0 ? (
                  <>
                    <Divider my={5} />
                    <InstanceCard instances={instances} />
                    <Divider />
                  </>
                ) : (
                  <Box
                    textAlign="center"
                    pb={5}
                    display={{ base: 'none', md: 'block' }}
                  >
                    <Lottie
                      style={{
                        width: '50%',
                        zIndex: -1,
                        overflow: 'hidden',
                        display: 'inline-block',
                      }}
                      animationData={RobotSwing}
                      loop
                    />
                    <Text>Create Instance to get started.</Text>
                  </Box>
                )}
              </GridItem>
              {instances && instances?.length > 0 && selectedInstance && (
                <Box my={5}>
                  <Connects instance={selectedInstance} />
                </Box>
              )}
            </GridItem>
            {instances && instances?.length > 0 && selectedInstance ? (
              <GridItem
                colSpan={{ base: 24, md: selectedInstance ? 18 : 18 }}
                pl={0}
              >
                <Routes>
                  <Route path="*" element={<Instance />} />
                  <Route path="instance/:id/*" element={<Instance />}>
                    <Route
                      path="chat"
                      element={<Chat instance={selectedInstance} />}
                    />
                    <Route path="settings" element={<InstanceSettings />} />
                  </Route>
                </Routes>
              </GridItem>
            ) : (
              <GridItem
                colSpan={{ base: selectedInstance ? 17 : 24, md: 12 }}
                px={4}
              >
                <Divider />
                <Box
                  style={{
                    textAlign: 'center',
                    display: 'inline-block',
                    width: '100%',
                  }}
                >
                  <Box height="100%" display="inline-block" mt={0} mb={20}>
                    <Lottie
                      style={{
                        width: '30%',
                        zIndex: -1,
                        display: 'inline-block',
                      }}
                      animationData={Rocket}
                      loop
                    />
                    <Heading fontSize="xl" fontWeight="600">
                      Set up your initial Instance and embark on your Telow AI
                      adventure.
                    </Heading>
                    <Text mb={7} mt={2}>
                      Add your first Telow Instance to start using Telow.
                    </Text>
                    <AddInstance />
                  </Box>
                </Box>
              </GridItem>
            )}
          </Grid>
        ) : (
          <Navigate to="settings/billing" />
        )}
      </Box>
    </SideNav>
  );
};

export default Dashboard;
