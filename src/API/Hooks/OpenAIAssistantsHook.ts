import { useQuery } from '@apollo/client';
import { OpenAIAssistant } from '../Model/OpenAIAssistantModel';
import { GetOpenAIAssistantQuery } from '../GraphQL/OpenAIAssistantsGraphQL';

const useGetOpenAIAssistant = (
  instance_id: string
): OpenAIAssistant | undefined => {
  const { data } = useQuery(GetOpenAIAssistantQuery, {
    variables: { id: instance_id },
  });
  return data?.openai_assistants[0];
};

export default useGetOpenAIAssistant;
