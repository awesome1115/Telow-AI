export interface Bug {
  id: string;
  domain: string;
  url: string;
  created_at: string;
  updated_at: string;
  type: string;
  message: string;
  language: string;
  instance_id: string;
  resolved: string;
  error_code: string;
  note: string;
  __typename: string;
  ai_responses: [
    {
      response: string;
      user_id: string;
      id: string;
      api_version: string;
    },
  ];
}
