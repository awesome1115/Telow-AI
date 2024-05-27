import { gql } from '@apollo/client';

/**
 * Queries
 */

export const GetBugsPerInstanceQuery = gql`
  query GetBugsPerInstance($instance_id: uuid!) {
    bugs(where: { instance_id: { _eq: $instance_id } }) {
      id
      domain
      url
      created_at
      updated_at
      type
      message
      language
      instance_id
      resolved
      error_code
      note
    }
  }
`;

export const GetSingleBugQuery = gql`
  query GetSingleBug($id: Int!) {
    bugs(where: { id: { _eq: $id } }) {
      type
      message
      language
      instance_id
      id
      url
      error_code
      domain
      created_at
      note
    }
  }
`;

export const UpdateBugNoteQuery = gql`
  mutation UpdateBugNote($id: Int!, $note: String!) {
    update_bugs(where: { id: { _eq: $id } }, _set: { note: $note }) {
      returning {
        id
        note
      }
    }
  }
`;

export const BugStreamQuery = gql`
  subscription BugStream($instance_id: uuid!) {
    bugs(where: { instance_id: { _eq: $instance_id } }) {
      id
      domain
      created_at
      error_code
      language
      message
      type
      url
      resolved
      instance_id
    }
  }
`;
