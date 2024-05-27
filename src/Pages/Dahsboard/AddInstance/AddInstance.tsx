import { AddIcon } from '@chakra-ui/icons';
import './AddInstance.scss';
import {
  Button,
  useToast,
  FormControl,
  FormHelperText,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  useDisclosure,
  Spinner,
} from '@chakra-ui/react';
import { FC, FormEventHandler, useEffect, useState } from 'react';
import { Form, useNavigate } from 'react-router-dom';
import { useAuthorizer } from '@authorizerdev/authorizer-react';
import { useMutation } from '@apollo/client';
import Stripe from 'stripe';
import { useTour } from '@reactour/tour';
import { StripeError } from '@stripe/stripe-js';
import axios from 'axios';
import {
  CreateInstanceQuery,
  GetInstancesQuery,
} from '../../../API/GraphQL/InstancesGraphQL';
import { Instances } from '../../../API/Model/InstancesModel';

interface AddInstanceProps {}

const AddInstance: FC<AddInstanceProps> = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [domain, setDomain] = useState<string>('');
  const [domainScreenshot, setDomainScreenshot] = useState<string>('');
  const [createInstance, { loading }] = useMutation(CreateInstanceQuery);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [stripe, setStripe] = useState<Stripe>();
  const { user } = useAuthorizer();
  const toast = useToast();
  const { setCurrentStep } = useTour();
  const navigate = useNavigate();

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

  const createInstanceSubscription = async (stripeCustomer: string) => {
    try {
      await stripe?.customers
        .retrieve(stripeCustomer)
        .then(async (response: unknown) => {
          const customer = response as Stripe.Customer;
          if (customer.invoice_settings.default_payment_method) {
            if (stripe && domain) {
              await stripe.subscriptions
                .create({
                  customer: stripeCustomer,
                  items: [
                    {
                      price: import.meta.env
                        .VITE_STRIPE_CURRENT_PRICE as string,
                    },
                  ],
                  payment_settings: {
                    save_default_payment_method: 'on_subscription',
                    payment_method_types: ['card'],
                  },
                  proration_behavior: 'create_prorations',
                  trial_period_days: 14,
                  metadata: {
                    domain,
                  },
                })
                .then(async (data: Stripe.Subscription) => {
                  try {
                    const onlyDomain = domain.replace(
                      /(^\w+:|^)\/\/|www\.|\/.*$/g,
                      ''
                    );
                    const { data: resData } = await axios({
                      method: 'get',
                      url: `https://dr5uhki0g9.execute-api.us-east-1.amazonaws.com/dev/whois/${onlyDomain}`,
                    });

                    if (resData.data === 'ERROR_BAD_ADDRESS') {
                      toast({
                        title: 'Not Valid Domain',
                        description: 'This domain is not valid.',
                        status: 'error',
                        duration: 9000,
                        isClosable: true,
                      });
                      setFormSubmitted(false);
                      return;
                    }

                    createInstance({
                      variables: {
                        domain,
                        domain_screenshot: domainScreenshot,
                        user_id: user?.id,
                        subscription_id: data.id,
                      },
                      async onCompleted(instance: Instances) {
                        if (instance) {
                          onClose();
                          setDomain('');
                          setDomainScreenshot('');
                          setFormSubmitted(false);
                          setCurrentStep(3);
                          toast({
                            title: 'Site Added',
                            description:
                              'You have successfully added your instance.',
                            status: 'success',
                            duration: 9000,
                            isClosable: true,
                          });
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
                  } catch (error: unknown) {
                    onClose();
                    setDomain('');
                    setDomainScreenshot('');
                    setFormSubmitted(false);
                    toast({
                      title: 'Failed to Add Instance.',
                      description: error as string,
                      status: 'error',
                      duration: 9000,
                      isClosable: true,
                    });
                  }
                })
                .catch((error: StripeError) => {
                  onClose();
                  setDomain('');
                  setDomainScreenshot('');
                  setFormSubmitted(false);
                  if (error.code === 'resource_missing') {
                    toast({
                      title: 'Payment Issue',
                      description: error.message,
                      status: 'error',
                      duration: 9000,
                      isClosable: true,
                    });
                  }
                });
            } else {
              return null;
            }
          } else {
            onClose();
            setDomain('');
            setDomainScreenshot('');
            setFormSubmitted(false);
            navigate('/settings/billing');
            toast({
              title: 'Set Default Payment',
              description:
                'Default payment require in order to crear a new instance.',
              status: 'error',
              duration: 9000,
              isClosable: true,
            });
          }
          return null;
        });
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    setFormSubmitted(true);
    e.preventDefault();
    const checkStripeUser = await stripe?.customers.list({
      email: user?.email,
    });
    if (checkStripeUser) {
      createInstanceSubscription(checkStripeUser?.data[0].id);
    }
  };

  const onChangeDomain = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value.trim();
    setDomain(inputValue);
  };

  return (
    <>
      <Button
        size="md"
        zIndex={0}
        onClick={() => {
          onOpen();
          setCurrentStep(2);
        }}
        variant="outline"
        background="white"
        boxShadow="lg"
        className="addInstance"
      >
        Create New Instance
        <AddIcon ml={2} />
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        {loading && <Spinner />}
        <ModalContent mx={5} className="addInstanceInput">
          <ModalBody p={0}>
            <Form onSubmit={(e) => onSubmit(e)}>
              <FormControl>
                <Input
                  disabled={formSubmitted}
                  type="url"
                  placeholder="Enter your site URL"
                  height={50}
                  borderRadius={0}
                  onChange={onChangeDomain}
                />
                <Button
                  width="100%"
                  borderRadius={0}
                  type="submit"
                  isDisabled={domain!.length === 0 || formSubmitted}
                >
                  Create
                </Button>
                <FormHelperText position="fixed" color="white">
                  Please include &quot;https&quot; or &quot;http&quot;.
                </FormHelperText>
              </FormControl>
            </Form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddInstance;
