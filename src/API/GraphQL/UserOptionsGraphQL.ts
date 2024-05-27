import { gql } from '@apollo/client';

/**
 * Queries
 */

export const GetUserOptionsQuery = gql`
  query GetUserOptions {
    user_options {
      openAI
      openAI_version
      stripeId
      user_id
    }
  }
`;

export const UpdateUserOptionsOpenAIQuery = gql`
  mutation UpdateUserOptions(
    $user_id: String!
    $openAIKey: String!
    $openAIVersion: String!
  ) {
    update_user_options(
      where: { user_id: { _eq: $user_id } }
      _set: { openAI: $openAIKey, openAI_version: $openAIVersion }
    ) {
      returning {
        user_id
        openAI
        openAI_version
      }
    }
  }
`;

export const CreateUserOptionsWithStripeIdQuery = gql`
  mutation InsertUserOptions($user_id: String!, $stripeId: String!) {
    insert_user_options(objects: { user_id: $user_id, stripeId: $stripeId }) {
      returning {
        user_id
        stripeId
      }
    }
  }
`;
