import { MessageModel } from '@chatscope/chat-ui-kit-react';

export interface OpenAIAssistant {
  id: string;
  assistant: any;
  thread: any;
  updated_at: string;
  created_at: string;
  instance_id: string;
  user_id: string;
  messages: MessageModel[];
}
