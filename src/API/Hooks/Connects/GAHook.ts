import { useQuery, useMutation } from '@apollo/client';
import { GAConnect } from '../../Model/Connects/GAModel';
import {
  CreateGAConnectQuery,
  GetGAConnectQuery,
  UpdateRefreshTokenGAConnectQuery,
  UpdateViewIdGAConnectQuery,
} from '../../GraphQL/Connects/GAGraphQL';

export const useGetGAConnect = (instance_id: string): GAConnect => {
  const { data } = useQuery(GetGAConnectQuery, { variables: { instance_id } });
  return data?.ga_connects[0];
};

export const useUpdateViewIdGAConnect = async () => {
  const [updateGAConnect] = useMutation(UpdateViewIdGAConnectQuery);
  return async (instance_id: string, view_id: string) => {
    const { data } = await updateGAConnect({
      variables: { instance_id, view_id },
      refetchQueries: [
        {
          query: GetGAConnectQuery,
          variables: { instance_id }, // Assuming GetGAConnectQuery requires instance_id as a variable
        },
      ],
      awaitRefetchQueries: true,
    });
    return data.update_ga_connects.returning[0];
  };
};

export const useUpdateRefreshTokendGAConnect = async () => {
  const [updateGAConnect] = useMutation(UpdateRefreshTokenGAConnectQuery);
  return async (instance_id: string, refresh_token: string) => {
    const { data } = await updateGAConnect({
      variables: { instance_id, refresh_token },
      refetchQueries: [
        {
          query: GetGAConnectQuery,
          variables: { instance_id }, // Assuming GetGAConnectQuery requires instance_id as a variable
        },
      ],
      awaitRefetchQueries: true,
    });
    return data.update_ga_connects.returning[0];
  };
};

export const useCreateGAConnect = () => {
  const [insertGAConnect] = useMutation(CreateGAConnectQuery);
  return async (userId: string, instance_id: string, code: string) => {
    const { data } = await insertGAConnect({
      variables: { user_id: userId, instance_id, code },
      refetchQueries: [
        {
          query: GetGAConnectQuery,
          variables: { instance_id },
        },
      ],
      awaitRefetchQueries: true,
    });
    return data.insert_ga_connects.returning[0];
  };
};
