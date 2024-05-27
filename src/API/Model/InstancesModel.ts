import { Bug } from './BugsModel';
import { GAConnect } from './Connects/GAModel';
import { OpenAIAssistant } from './OpenAIAssistantModel';

export interface Instances {
  domain: string;
  domain_screenshot: string;
  id: string;
  subscription_id: string;
  user_id: string;
  updated_at: string;
  created_at: string;
  status: string;
  bugs: Bug[];
  openai_assistants: OpenAIAssistant[];
  ga_connect: GAConnect;
}
