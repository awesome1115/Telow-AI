import { gql } from '@apollo/client';

/**
 * Queries
 */

export const GetOpenAIAssistantQuery = gql`
  query GetOpenAIAssistant($instance_id: uuid!) {
    openai_assistants(where: { instance_id: { _eq: $instance_id } }) {
      id
      assistant
      thread
      messages
      created_at
      updated_at
      instance_id
      user_id
    }
  }
`;

/**
 * Mutation
 */

export const CreateAssistantQuery = gql`
  mutation CreateAssistant(
    $assistant: json!
    $thread: json!
    $instance_id: uuid!
    $user_id: String!
  ) {
    insert_openai_assistants(
      objects: {
        assistant: $assistant
        thread: $thread
        instance_id: $instance_id
        user_id: $user_id
      }
    ) {
      returning {
        id
        assistant
        created_at
        updated_at
        instance_id
        user_id
        thread
        messages
      }
    }
  }
`;

export const UpdateAssistantMessageQuery = gql`
  mutation UpdateAssistantMessages(
    $id: uuid!
    $user_id: String!
    $instance_id: uuid!
    $messages: json!
  ) {
    update_openai_assistants(
      where: {
        user_id: { _eq: $user_id }
        instance_id: { _eq: $instance_id }
        id: { _eq: $id }
      }
      _set: { messages: $messages }
    ) {
      returning {
        instance_id
        messages
        user_id
        updated_at
        created_at
        id
      }
    }
  }
`;

export const DeleteAssistantByInstanceId = gql`
  mutation DeleteAssistant($instance_id: uuid!) {
    delete_openai_assistants(where: { instance_id: { _eq: $instance_id } }) {
      returning {
        id
      }
    }
  }
`;
