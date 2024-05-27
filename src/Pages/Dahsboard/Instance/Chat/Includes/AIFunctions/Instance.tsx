import useApolloClient from '../../../../../../Service/Apollo';
import { GetSingleInstanceQuery } from '../../../../../../API/GraphQL/InstancesGraphQL';

/**
 * Instance Information Query
 * @param id
 * @returns
 */
const useGetSingleInstance = async (id?: string): Promise<string> => {
  const apolloClient = useApolloClient();
  try {
    const { data } = await apolloClient.query({
      query: GetSingleInstanceQuery,
      variables: { id },
    });
    return JSON.stringify(data?.instances[0]);
  } catch (error) {
    return error as string;
  }
};

export default useGetSingleInstance;
