import { useAuthorizer } from '@authorizerdev/authorizer-react';
import {
  Grid,
  Box,
  GridItem,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Button,
  FormHelperText,
  useToast,
} from '@chakra-ui/react';
import { Field, Form, Formik } from 'formik';
import React, { FC, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApolloError, useMutation } from '@apollo/client';
import Stripe from 'stripe';
import { UserOptions } from '../../../API/Model/UserOptionsModel';
import useGetUserOptions from '../../../API/Hooks/UserOptionsHook';
import {
  GetUserOptionsQuery,
  UpdateUserOptionsOpenAIQuery,
} from '../../../API/GraphQL/UserOptionsGraphQL';

interface AdvancedProps {}

const Advanced: FC<AdvancedProps> = () => {
  const userOptions: UserOptions | undefined = useGetUserOptions();
  const [openAIKey, setOpenAIKey] = useState<string>('OpenAI Key');
  const [openAIVersion, setOpenVerison] = useState<string>();
  const [updateUserOptions] = useMutation(UpdateUserOptionsOpenAIQuery);
  const [, setStripe] = useState<Stripe>();
  const { user } = useAuthorizer();
  const toast = useToast();

  useEffect(() => {
    if (userOptions?.openAI) {
      setOpenAIKey(userOptions.openAI);
    }
    if (userOptions?.openAI_version) {
      setOpenVerison(userOptions.openAI_version);
    }
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
  }, [userOptions.openAI, userOptions.openAI_version]);

  const formatAsteriskInput = (value: string): string => {
    if (value.length >= 8) {
      const first3Characters = value.slice(0, 3);
      const last5Characters = value.slice(-5);
      const asteriskValue =
        first3Characters + '*'.repeat(value.length - 8) + last5Characters;
      return asteriskValue;
    }
    return value;
  };

  return (
    <Grid templateColumns="repeat(12, 1fr)" mt={5} gap={5} px={5}>
      <GridItem colSpan={{ base: 12, md: 6 }}>
        <Box>
          <Formik
            enableReinitialize
            initialValues={{
              openAIKey: formatAsteriskInput(openAIKey),
              openAIVersion,
            }}
            onSubmit={(values, actions) => {
              setTimeout(() => {
                updateUserOptions({
                  variables: {
                    openAIKey,
                    openAIVersion: values.openAIVersion,
                    user_id: user?.id,
                  },
                  onCompleted() {
                    toast({
                      title: 'Advanced Options Saved.',
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
                actions.setSubmitting(false);
              }, 1000);
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <Grid templateColumns="repeat(12, 1fr)" gap={5}>
                  <GridItem colSpan={{ base: 12 }}>
                    <Field name="openAIKey">
                      {({ field, form }: FieldProps) => (
                        <FormControl>
                          <FormLabel>Open AI Key</FormLabel>
                          <FormHelperText>
                            To get help from Telow AI prompts, you must enter
                            your OpenAI key.{' '}
                            <Link
                              target="_blank"
                              style={{ color: '#6e94ab' }}
                              to="https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key"
                            >
                              How to find my key?
                            </Link>
                          </FormHelperText>
                          <Input
                            fontFamily="monospace"
                            mt={3}
                            border="2px solid #d2e0f1"
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...field}
                            onChange={(data) => {
                              setOpenAIKey(data.target.value);
                            }}
                            variant="filled"
                            size="lg"
                            placeholder="sk-xxxxxxxxxxxxx"
                          />
                          <FormErrorMessage>
                            {form.errors.openAiKey}
                          </FormErrorMessage>
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
    </Grid>
  );
};

export default Advanced;

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
