import { AssistantCreateParams } from 'openai/resources/beta/assistants/assistants';
import GA from './AITools/GA';
import Instance from './AITools/Instance';

const Tools: (
  | AssistantCreateParams.AssistantToolsCode
  | AssistantCreateParams.AssistantToolsFunction
)[] = [Instance(), GA()];

export default Tools;
