import { gql } from '@apollo/client';

/**
 * Queries
 */

export const GetInstancesQuery = gql`
  query GetInstances {
    instances(where: { status: { _eq: "active" } }) {
      domain
      created_at
      domain_screenshot
      subscription_id
      id
      updated_at
      user_id
      status
      bugs {
        url
        domain
        created_at
        instance_id
        message
        type
        language
        resolved
        id
      }
      openai_assistants {
        id
        assistant
        thread
        created_at
        updated_at
        instance_id
        user_id
        messages
      }
      ga_connect {
        view_id
        user_id
        created_at
        id
      }
    }
  }
`;

export const GetSingleInstanceQuery = gql`
  query GetSingleInstance($id: uuid!) {
    instances(where: { id: { _eq: $id }, status: { _eq: "active" } }) {
      domain
      domain_screenshot
      id
      subscription_id
      user_id
      updated_at
      created_at
      status
      bugs {
        url
        id
        domain
        created_at
        instance_id
        message
        type
        language
        resolved
        note
      }
      openai_assistants {
        id
        assistant
        thread
        created_at
        updated_at
        instance_id
        user_id
        messages
      }
      ga_connect {
        view_id
        user_id
        created_at
        id
      }
    }
  }
`;

/**
 * Mutation
 */
export const CreateInstanceQuery = gql`
  mutation CreateInstance(
    $domain: String!
    $domain_screenshot: String!
    $user_id: String!
    $subscription_id: String!
  ) {
    insert_instances(
      objects: {
        domain: $domain
        domain_screenshot: $domain_screenshot
        user_id: $user_id
        subscription_id: $subscription_id
      }
    ) {
      returning {
        id
        domain
        subscription_id
      }
    }
  }
`;

export const UpdateInstanceStatusQuery = gql`
  mutation UpdateInstanceStatus($id: uuid!, $status: String!) {
    update_instances(where: { id: { _eq: $id } }, _set: { status: $status }) {
      returning {
        id
        updated_at
        user_id
        created_at
        domain
        domain_screenshot
        subscription_id
      }
    }
  }
`;

export const UpdateInstanceStatusByIdQuery = gql`
  mutation UpdateInstanceStatus($sub_id: String!, $status: String!) {
    update_instances(
      where: { subscription_id: { _eq: $sub_id } }
      _set: { status: $status }
    ) {
      returning {
        id
      }
    }
  }
`;
