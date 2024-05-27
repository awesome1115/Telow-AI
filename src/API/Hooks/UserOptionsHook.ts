import { useQuery } from '@apollo/client';
import { UserOptions } from '../Model/UserOptionsModel';
import { GetUserOptionsQuery } from '../GraphQL/UserOptionsGraphQL';

const useGetUserOptions = (): UserOptions => {
  const { data } = useQuery(GetUserOptionsQuery);
  return data?.user_options[0];
};

export default useGetUserOptions;
