import { RouterProvider } from 'react-router-dom';
import './App.scss';
import { useAuthorizer } from '@authorizerdev/authorizer-react';
import { Center, Spinner } from '@chakra-ui/react';
import { ApolloProvider } from '@apollo/client';
import { TourProvider } from '@reactour/tour';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LiveSupport from './Shared/SupportChat/SupportChat';
import AuthRouter from './Routers/Auth';
import MainRouter from './Routers/Main';
import { OpenAIProvider } from './Contexts/OpenAIContext';
import useApolloClient from './Service/Apollo';

const steps = [
  {
    selector: '.Instances',
    content:
      'Instances are the things you want to keep track of when identifying bugs.',
  },
  {
    selector: '.addInstance',
    content: 'Lets create a new instance.',
  },
  {
    selector: '.addInstanceInput',
    content:
      "Please enter your website address, ensuring that you use the correct protocol like 'http' or 'https,' and then press the 'Enter/Return' key on your keyboard.",
  },
  {
    selector: '.InstanceCard',
    content: 'Now, choose the instance you recently created.',
  },
  {
    selector: '.InstanceMenu',
    content: 'This is your Instance menu.',
  },
  {
    selector: '.InstanceContainer',
    content:
      'This is the instance container where you can view all the bugs, details, search for bugs, or perform any actions related to identifying issues and finding solutions.',
  },
];

const App = () => {
  const { user, loading } = useAuthorizer();
  const apollo = useApolloClient();

  if (loading) {
    return (
      <div style={{ width: '100%', height: '100%', position: 'fixed' }}>
        <Center w="100%" h="100%" bg="white" color="#000">
          <Spinner margin="auto" size="md" />
        </Center>
      </div>
    );
  }

  return (
    <ApolloProvider client={apollo}>
      {user ? (
        <TourProvider steps={steps}>
          <GoogleOAuthProvider
            clientId={import.meta.env.VITE_OAUTH_GOOGLE_CLIENT_ID}
          >
            <OpenAIProvider>
              <RouterProvider router={MainRouter} />
              <LiveSupport user={user} />
            </OpenAIProvider>
          </GoogleOAuthProvider>
        </TourProvider>
      ) : (
        <RouterProvider router={AuthRouter} />
      )}
    </ApolloProvider>
  );
};

export default App;
