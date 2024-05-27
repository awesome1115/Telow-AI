import { useQuery, useSubscription } from '@apollo/client';
import { useEffect, useState } from 'react';
import { Bug } from '../Model/BugsModel';
import {
  BugStreamQuery,
  GetBugsPerInstanceQuery,
  GetSingleBugQuery,
} from '../GraphQL/BugsGraphQL';

export const useGetInstanceBugs = (instance_id?: string): Bug[] | undefined => {
  const { data } = useQuery(GetBugsPerInstanceQuery, {
    variables: { instance_id },
  });
  return data?.bugs;
};

export const useBugSteam = (instance_id?: string): Bug[] => {
  const { data } = useSubscription(BugStreamQuery, {
    variables: { instance_id },
  });
  return data?.bugs;
};

export const useGetSingleBug = (id: number | undefined): Bug | null => {
  const [bug, setBug] = useState<Bug | null>(null);

  const { data, loading, error } = useQuery(GetSingleBugQuery, {
    variables: { id },
    skip: id === undefined || id === null, // Skip the query if id is not valid
  });

  useEffect(() => {
    if (data && !loading && !error) {
      setBug(data.bugs[0]);
    }
  }, [data, loading, error]);

  return bug;
};
