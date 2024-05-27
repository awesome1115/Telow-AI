import { gql } from '@apollo/client';

/**
 * Queries
 */

export const GetGAConnectQuery = gql`
  query GetGAConnects($instance_id: uuid!) {
    ga_connects(where: { instance_id: { _eq: $instance_id } }) {
      id
      created_at
      updated_at
      refresh_token
      code
      view_id
      user_id
      instance_id
    }
  }
`;

export const UpdateViewIdGAConnectQuery = gql`
  mutation UpdateGAConnect($instance_id: uuid!, $view_id: String!) {
    update_ga_connects(
      where: { instance_id: { _eq: $instance_id } }
      _set: { view_id: $view_id }
    ) {
      returning {
        id
        created_at
        updated_at
        refresh_token
        code
        view_id
        user_id
        instance_id
      }
    }
  }
`;

export const UpdateRefreshTokenGAConnectQuery = gql`
  mutation UpdateGAConnect($instance_id: uuid!, $refresh_token: String!) {
    update_ga_connects(
      where: { instance_id: { _eq: $instance_id } }
      _set: { refresh_token: $refresh_token }
    ) {
      returning {
        id
        created_at
        updated_at
        refresh_token
        code
        view_id
        user_id
        instance_id
      }
    }
  }
`;

export const CreateGAConnectQuery = gql`
  mutation InsertGAConnect(
    $user_id: String!
    $instance_id: uuid!
    $code: String!
  ) {
    insert_ga_connects(
      objects: { user_id: $user_id, instance_id: $instance_id, code: $code }
    ) {
      returning {
        id
        created_at
        updated_at
        refresh_token
        code
        user_id
        instance_id
      }
    }
  }
`;
