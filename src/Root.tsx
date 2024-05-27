import { AuthorizerProvider } from '@authorizerdev/authorizer-react';
import { ChakraProvider } from '@chakra-ui/react';
import ReactGA from 'react-ga4';
import App from './App';
import theme from './theme';
import './Root.scss';

ReactGA.initialize('G-N52YVK2TTP');

const Root = () => {
  return (
    <AuthorizerProvider
      config={{
        authorizerURL: import.meta.env.VITE_AUTH_URL as string,
        redirectURL: window.location.origin,
        clientID: import.meta.env.VITE_AUTH_CLIENT_ID,
      }}
    >
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </AuthorizerProvider>
  );
};

export default Root;
