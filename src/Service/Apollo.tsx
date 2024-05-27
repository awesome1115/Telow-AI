import { ApolloClient, InMemoryCache, split } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { createHttpLink } from '@apollo/client/link/http';
import { setContext } from '@apollo/client/link/context';
import { useAuthorizer } from '@authorizerdev/authorizer-react';

const useApolloClient = () => {
  const { token } = useAuthorizer();

  const httpLink = createHttpLink({
    uri: import.meta.env.VITE_HASURA_HTTP_URL, // Your Hasura GraphQL endpoint
  });

  const authLink = setContext((_, { headers }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token.id_token}` : '',
    },
  }));

  const wsLink = new WebSocketLink({
    uri: import.meta.env.VITE_HASURA_WS_URL, // Your Hasura WebSocket endpoint
    options: {
      reconnect: true,
      connectionParams: {
        headers: {
          Authorization: token ? `Bearer ${token.id_token}` : '',
        },
      },
    },
  });

  const link = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    authLink.concat(httpLink)
  );

  const client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });

  return client;
};

export default useApolloClient;
