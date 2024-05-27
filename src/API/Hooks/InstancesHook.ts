import { useQuery } from '@apollo/client';
import { Instances } from '../Model/InstancesModel';
import {
  GetInstancesQuery,
  GetSingleInstanceQuery,
} from '../GraphQL/InstancesGraphQL';

export const useGetInstances = (): Instances[] | undefined => {
  const { data } = useQuery(GetInstancesQuery);
  return data?.instances;
};

export const useGetSingleInstance = (id: string): Instances | undefined => {
  const { data } = useQuery(GetSingleInstanceQuery, { variables: { id } });
  return data?.instances[0];
};
