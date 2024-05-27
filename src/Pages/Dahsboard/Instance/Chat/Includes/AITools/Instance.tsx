import { AssistantCreateParams } from 'openai/resources/beta/assistants/assistants';

const Instance = (): AssistantCreateParams.AssistantToolsFunction => {
  return {
    type: 'function',
    function: {
      name: 'instance',
      description: 'Get Instance Information',
      parameters: {
        type: 'object',
        properties: {
          instance: {
            type: 'string',
            description:
              'Information about the instance. Provide the instance id, domain, and other useful information.',
          },
        },
        required: ['instance'],
      },
    },
  };
};
export default Instance;
