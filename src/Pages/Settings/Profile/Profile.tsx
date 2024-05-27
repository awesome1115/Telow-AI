import React, { FC, useEffect, useState } from 'react';
import { Field, Form, Formik } from 'formik';
import * as Yup from 'yup';
import Stripe from 'stripe';
import 'yup-phone-lite';
import {
  FormControl,
  useToast,
  FormLabel,
  Input,
  Button,
  Box,
  GridItem,
  Grid,
  Avatar,
  FormHelperText,
  Container,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { useAuthorizer } from '@authorizerdev/authorizer-react';
import { Authorizer } from '@authorizerdev/authorizer-js';
import './Profile.scss';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import {
  GetInstancesQuery,
  UpdateInstanceStatusByIdQuery,
} from '../../../API/GraphQL/InstancesGraphQL';

interface ProfileProps {}

const Profile: FC<ProfileProps> = () => {
  const [stripe, setStripe] = useState<Stripe>();
  const [emailConfirmed, setEmailConfirmed] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const onOpenDeleteModal = () => setIsDeleteModalOpen(true);
  const onCloseDeactivateModal = () => {
    setIsDeleteModalOpen(false);
  };
  const { user, authorizerRef, token, setUser, setToken } = useAuthorizer();
  const [phoneValue, setPhoneValue] = useState(user?.phone_number);
  const toast = useToast();
  const [updateInstance] = useMutation(UpdateInstanceStatusByIdQuery);
  const route = useNavigate();

  const authRef = new Authorizer({
    authorizerURL: import.meta.env.VITE_AUTH_URL as string,
    redirectURL: window.location.origin,
    clientID: import.meta.env.VITE_AUTH_CLIENT_ID as string,
  });

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

  const ProfileSchema = Yup.object().shape({
    firstName: Yup.string()
      .min(2, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Required'),
    lastName: Yup.string()
      .min(2, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
  });

  const onDeactivateAccount = async () => {
    if (user) {
      if (user.email === emailConfirmed) {
        if (stripe) {
          try {
            await stripe?.customers
              .list({ email: user.email })
              .then(async (list) => {
                if (list.data.length > 0) {
                  const customer = list.data[0];
                  const subscriptions = await stripe.subscriptions.list({
                    customer: customer.id,
                  });

                  subscriptions.data.map(async (sub) => {
                    await stripe.subscriptions
                      .cancel(sub.id, {
                        prorate: true,
                      })
                      .then(() => {
                        updateInstance({
                          variables: {
                            sub_id: sub.id,
                            status: 'inactive',
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
                      });
                  });
                }
              })
              .then(async () => {
                await authRef
                  .deactivateAccount({
                    Authorization: `Bearer s${token?.access_token}`,
                  })
                  .then(() => {
                    authorizerRef.logout();
                    setUser(null);
                    setToken(null);
                    route('/');
                  });
              });
          } catch (error) {
            console.log(error);
          }
        }
      } else {
        toast({
          title: 'Incorrent Email.',
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      }
    }
  };

  const onUpdateUserName = async (name: string, phone: string) => {
    await stripe?.customers.list({ email: user!.email }).then(async (list) => {
      if (list.data.length > 0) {
        const customer = list.data[0];
        await stripe.customers.update(customer.id, {
          name: `${name}`,
          metadata: {
            phone,
          },
        });
      }
    });
  };

  return (
    <Container maxW="container.xl" mx={0} px={0}>
      <Grid templateColumns="repeat(12, 1fr)" mt={5} gap={5} px={5}>
        <GridItem colSpan={{ base: 12, md: 6 }}>
          <Box px="25px">
            <Box mb={10}>
              <Avatar
                size="xl"
                name={`${user?.given_name} ${user?.family_name}`}
                src={user?.picture ? user.picture : ''}
              >
                {/* <AvatarBadge bottom={'10px'} right={'10px'} boxSize='0.7em' bg='white' boxShadow={'md'}>
                <BiMessageSquareEdit />
              </AvatarBadge> */}
              </Avatar>
            </Box>
            <Formik
              validationSchema={ProfileSchema}
              initialValues={{
                firstName: user?.given_name,
                lastName: user?.family_name,
                email: user?.email,
                phone: user?.phone_number,
              }}
              onSubmit={(values, actions) => {
                setTimeout(() => {
                  authorizerRef
                    .updateProfile(
                      {
                        family_name: values?.lastName as string,
                        given_name: values.firstName as string,
                        phone_number: phoneValue as string,
                        email: values.email as string,
                      },
                      {
                        Authorization: `Bearer ${token?.access_token}`,
                      }
                    )
                    .then((data) => {
                      onUpdateUserName(
                        `${values.firstName} ${values.lastName}`,
                        phoneValue as string
                      );
                      if (data) {
                        toast({
                          title: 'Account Updated',
                          status: 'success',
                          duration: 9000,
                          isClosable: true,
                        });
                      }
                    })
                    .catch((error) => {
                      toast({
                        title: 'Something is wrong!',
                        description: error.message,
                        status: 'error',
                        duration: 9000,
                        isClosable: true,
                      });
                    });

                  actions.setSubmitting(false);
                }, 1000);
              }}
            >
              {({ isSubmitting }) => (
                <Form>
                  <Grid templateColumns="repeat(12, 1fr)" gap={5}>
                    <GridItem colSpan={{ base: 6 }}>
                      <Field name="firstName">
                        {({ field, form }: FieldProps) => (
                          <FormControl>
                            <FormLabel>First Name</FormLabel>
                            <Input
                              border="2px solid #d2e0f1"
                              // eslint-disable-next-line react/jsx-props-no-spreading
                              {...field}
                              variant="filled"
                              size="lg"
                            />
                            <FormHelperText color="red.800">
                              {form.errors.firstName}
                            </FormHelperText>
                          </FormControl>
                        )}
                      </Field>
                    </GridItem>
                    <GridItem colSpan={{ base: 6 }}>
                      <Field name="lastName">
                        {({ field, form }: FieldProps) => (
                          <FormControl>
                            <FormLabel>Last Name</FormLabel>
                            <Input
                              border="2px solid #d2e0f1"
                              // eslint-disable-next-line react/jsx-props-no-spreading
                              {...field}
                              variant="filled"
                              size="lg"
                            />
                            <FormHelperText color="red.800">
                              {form.errors.lastName}
                            </FormHelperText>
                          </FormControl>
                        )}
                      </Field>
                    </GridItem>
                    {user?.signup_methods.includes('basic_auth') && (
                      <GridItem colSpan={{ base: 12 }}>
                        <Field name="email">
                          {({ field, form }: FieldProps) => (
                            <FormControl>
                              <FormLabel>Email</FormLabel>
                              <Input
                                border="2px solid #d2e0f1"
                                // eslint-disable-next-line react/jsx-props-no-spreading
                                {...field}
                                variant="filled"
                                size="lg"
                              />
                              <FormHelperText color="red.800">
                                {form.errors.email}
                              </FormHelperText>
                            </FormControl>
                          )}
                        </Field>
                      </GridItem>
                    )}
                    <GridItem colSpan={{ base: 12 }}>
                      <Field name="phone">
                        {({ field }: FieldProps) => (
                          <FormControl>
                            <FormLabel>Phone</FormLabel>
                            <PhoneInput
                              countries={['US', 'CA', 'MX']}
                              className="phoneField"
                              style={{
                                border: '2px solid #d2e0f1',
                                borderRadius: '5px',
                              }}
                              // eslint-disable-next-line react/jsx-props-no-spreading
                              {...field}
                              placeholder="Enter phone number"
                              onChange={(data: unknown) => {
                                setPhoneValue(data as string);
                              }}
                            />
                          </FormControl>
                        )}
                      </Field>
                    </GridItem>
                  </Grid>
                  <Button
                    mt={4}
                    backgroundColor="#A1FE01"
                    isLoading={isSubmitting}
                    type="submit"
                  >
                    Save
                  </Button>
                </Form>
              )}
            </Formik>
          </Box>
        </GridItem>
        <GridItem colSpan={{ base: 12, md: 6 }} />
      </Grid>
      <Grid templateColumns="repeat(12, 1fr)" mt={5} gap={5} px={5}>
        <GridItem colSpan={{ base: 12, md: 5 }}>
          <Box px="25px" py="50px">
            <Text as="b">Deactivate Account</Text>
            <Text color="gray.400">
              Once your account is deactivated all of your instances will not
              track any bugs
            </Text>
            <Box py="15px">
              <Button colorScheme="red" py="20px" onClick={onOpenDeleteModal}>
                Deactivate account
              </Button>
            </Box>
            <Modal
              isOpen={isDeleteModalOpen}
              onClose={onCloseDeactivateModal}
              size="md"
            >
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Deactivate Account</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Text>Are you sure you want to deactivate your account?</Text>
                  <Text color="gray.400">
                    This action can&lsquo;t be reversed
                  </Text>
                  <Input
                    mt={2}
                    placeholder="Enter your account email"
                    type="email"
                    size="lg"
                    onChange={(data) => {
                      setEmailConfirmed(data.target.value);
                    }}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    colorScheme="gray"
                    variant="ghost"
                    onClick={onCloseDeactivateModal}
                    mr={3}
                  >
                    Cancel
                  </Button>
                  <Button colorScheme="red" onClick={onDeactivateAccount}>
                    Deactivate
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default Profile;

interface FieldProps {
  field: {
    name: string;
    value: string;
    onChange: (event: React.ChangeEvent<unknown>) => void;
    onBlur: (event: React.FocusEvent<unknown>) => void;
  };
  form: {
    touched: { [field: string]: boolean };
    errors: { [field: string]: string };
  };
  meta: {
    error?: string;
    touched?: boolean;
  };
}
