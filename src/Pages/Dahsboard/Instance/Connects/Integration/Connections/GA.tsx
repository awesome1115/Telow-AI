import React, { FC, useEffect, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useGoogleLogin } from '@react-oauth/google';
import { Box, Button, Flex, Image, Select, useToast } from '@chakra-ui/react';
import { useAuthorizer } from '@authorizerdev/authorizer-react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { gapi } from 'gapi-script';
import axios, { AxiosResponse } from 'axios';
import GoogleAnalyticsIcon from '@assets/thirdparty/google-analytics.svg';
import {
  useGetGAConnect,
  useCreateGAConnect,
  useUpdateViewIdGAConnect,
  useUpdateRefreshTokendGAConnect,
} from '../../../../../../API/Hooks/Connects/GAHook';
import useActiveInstanceStore from '../../../../../../States/instancesStore';

interface GAProperty {
  property: string;
  displayName: string;
}

const GAConnect: FC = () => {
  const activeInstance = useActiveInstanceStore((state) => state.instance);
  const getGAConnect = useGetGAConnect(activeInstance!.id);
  const createGAConnect = useCreateGAConnect();
  const updateViewIdGAConnect = useUpdateViewIdGAConnect();
  const updateRefreshTokenGAConnect = useUpdateRefreshTokendGAConnect();
  const [gaProperties, setGAProperties] = useState<GAProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const toast = useToast();
  const { user } = useAuthorizer();

  useEffect(() => {
    if (!getGAConnect) return;
    const setAuth = () => {
      const url: string = 'https://oauth2.googleapis.com/token';
      const params = new URLSearchParams({
        client_id: import.meta.env.VITE_OAUTH_GOOGLE_CLIENT_ID,
        client_secret: import.meta.env.VITE_OAUTH_GOOGLE_CLIENT_SECRET,
        redirect_uri: import.meta.env.VITE_APP_URL,
        grant_type: 'refresh_token',
        refresh_token: getGAConnect.refresh_token,
      });

      axios
        .post(url, params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
        .then((response: AxiosResponse) => {
          gapi.auth.setToken({
            access_token: response.data.access_token,
            expires_in: (365 * 24 * 60 * 60).toString(),
            error: '',
            state: '',
          });
          gapi.client
            .request({
              path: 'https://analyticsadmin.googleapis.com/v1beta/accountSummaries',
            })
            .then(
              (clientResponse) => {
                const accounts = clientResponse.result.accountSummaries;
                accounts.forEach(
                  (account: {
                    propertySummaries: React.SetStateAction<unknown[]>;
                  }) => {
                    setGAProperties(account.propertySummaries as GAProperty[]);
                  }
                );
              },
              (reason) => {
                console.error(`Error: ${reason.result.error.message}`);
              }
            );
        })
        .catch((error) => {
          throw new Error(`Error: Failed to receive access token --> ${error}`);
        });
    };

    gapi.load('client:auth2', setAuth);
    if (getGAConnect && getGAConnect.view_id) {
      setSelectedProperty(getGAConnect.view_id);
    }
  }, [activeInstance?.id, getGAConnect]);

  const handleGoogleLogin = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    include_granted_scopes: true,
    redirect_uri: import.meta.env.VITE_APP_URL,
    state: 'state_parameter_passthrough_value',
    onSuccess: async (credentialResponse) => {
      await createGAConnect(
        user!.id,
        activeInstance!.id,
        credentialResponse.code
      ).then(() => {
        const url: string = 'https://oauth2.googleapis.com/token';
        const params = new URLSearchParams({
          code: credentialResponse.code,
          client_id: import.meta.env.VITE_OAUTH_GOOGLE_CLIENT_ID,
          client_secret: import.meta.env.VITE_OAUTH_GOOGLE_CLIENT_SECRET,
          redirect_uri: import.meta.env.VITE_APP_URL,
          grant_type: 'authorization_code',
        });
        axios
          .post(url, params, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })
          .then(async (response: AxiosResponse) => {
            await (
              await updateRefreshTokenGAConnect
            )(activeInstance!.id, response.data.refresh_token);
          })
          .catch((error) => {
            throw new Error(
              `Error: Failed to receive access token --> ${error}`
            );
          });
      });
    },
    flow: 'auth-code',
    onError: (error) => {
      console.log(error);
    },
  });

  return (
    <Box display="flex" flexDirection={{ base: 'column', md: 'row' }}>
      {getGAConnect ? (
        <>
          <Select
            value={selectedProperty}
            placeholder="Select Property View"
            maxWidth={{ base: '100%', md: '220px' }}
            marginBottom={{ base: '10px', md: '0' }}
            mr={2}
            onChange={async (event) => {
              const newValue = event.target.value;
              setSelectedProperty(newValue);
              await (
                await updateViewIdGAConnect
              )(activeInstance!.id, newValue).then((updated) => {
                if (updated.instance_id === activeInstance!.id) {
                  toast({
                    title: 'Property View Updated',
                    status: 'success',
                    duration: 1000,
                    isClosable: true,
                  });
                }
              });
            }}
          >
            {gaProperties.map((view) => (
              <option key={view.property} value={view.property}>
                {view.displayName} - {view.property}
              </option>
            ))}
          </Select>
          <Button color="white" background="black" minWidth="220px">
            <Flex textAlign="left">
              <Image
                src={GoogleAnalyticsIcon}
                width="20px"
                height="20px"
                mr={3}
              />
              You are connected
            </Flex>
          </Button>
        </>
      ) : (
        <Button onClick={() => handleGoogleLogin()}>
          <Flex textAlign="left">
            <Image
              src={GoogleAnalyticsIcon}
              width="20px"
              height="20px"
              mr={3}
            />
            Authenticate Google Analytics
          </Flex>
        </Button>
      )}
    </Box>
  );
};

export default GAConnect;
