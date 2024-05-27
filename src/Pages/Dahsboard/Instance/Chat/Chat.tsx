import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  MessageModel,
  TypingIndicator,
  Avatar,
} from '@chatscope/chat-ui-kit-react';
import './Chat.scss';
import { Box, Button, Grid, GridItem, Text } from '@chakra-ui/react';
import { useAuthorizer } from '@authorizerdev/authorizer-react';
import { useMutation } from '@apollo/client';
import { Assistant } from 'openai/resources/beta/assistants/assistants';
import { Thread } from 'openai/resources/beta/threads/threads';
import { MessageDirection } from '@chatscope/chat-ui-kit-react/src/types/unions';
import { IoAdd } from 'react-icons/io5';
import TelowLogoGreen from '@assets/images/square-icon-logo-green-background.jpg';
import { Instances } from '../../../../API/Model/InstancesModel';
import { GetInstancesQuery } from '../../../../API/GraphQL/InstancesGraphQL';
import {
  CreateAssistantQuery,
  DeleteAssistantByInstanceId,
  UpdateAssistantMessageQuery,
} from '../../../../API/GraphQL/OpenAIAssistantsGraphQL';
import { useOpenAI } from '../../../../Contexts/OpenAIContext';
import Prompts from './Includes/Prompts';
import Tools from './Includes/Tools';
import MarkdownRenderer from './Includes/Markdown/Markdown';

import { useGetGAConnect } from '../../../../API/Hooks/Connects/GAHook';
import { OpenAIAssistant } from '../../../../API/Model/OpenAIAssistantModel';

/**
 * Functions
 */
import queryGoogleAnalytics from './Includes/AIFunctions/GA';
import useGetSingleInstance from './Includes/AIFunctions/Instance';

interface ChatProps {
  instance: Instances | undefined;
}

const Chat: FC<ChatProps> = ({ instance }) => {
  const placeholderMessage: MessageModel = {
    position: 'single',
    message: 'Welcome to Telow chat! How can we assist you today?',
    sender: 'Telow',
    sentTime: String(Date.now()),
    direction: 'incoming', // Assuming 'Telow' is the sender
  };
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [updateAssistantMessages] = useMutation(UpdateAssistantMessageQuery);
  const [createNewAssistant] = useMutation(CreateAssistantQuery);
  const [deleteExistingAssistantByInstanceId] = useMutation(
    DeleteAssistantByInstanceId
  );
  const { user } = useAuthorizer();
  const [activeAssistant, setActiveAssistant] = useState<OpenAIAssistant>();
  const [assistant, setAssistant] = useState<Assistant>();
  const [thread, setThread] = useState<Thread>();
  const openai = useOpenAI();
  const messageListRef = useRef<HTMLDivElement>(null);
  const gaConnect = useGetGAConnect(instance!.id);

  /**
   * Function Init
   */

  const getSingleInstance = useGetSingleInstance(instance?.id as string);
  /**
   * Assistant & Thread
   */

  const formatDate = (date: {
    getFullYear: () => number;
    getMonth: () => number;
    getDate: () => number;
    getHours: () => number;
    getMinutes: () => number;
    getSeconds: () => number;
  }) => {
    const pad = (num: number) => (num < 10 ? `0${num}` : num);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
  };

  const isAssistantOutdated = (checkAssistant: Assistant): boolean => {
    const expirateDate = 24 * 60 * 60 * 1000; // milliseconds in one day
    const creationDate = new Date(checkAssistant.created_at);
    const currentDate = new Date();
    return currentDate.getTime() - creationDate.getTime() > expirateDate;
  };

  const deleteInstanceOldAssistant = useCallback(
    async (instanceId: string) => {
      try {
        await deleteExistingAssistantByInstanceId({
          variables: {
            instance_id: instanceId,
          },
          refetchQueries: [{ query: GetInstancesQuery }],
        });
      } catch (error) {
        console.error(error);
      }
    },
    [deleteExistingAssistantByInstanceId]
  );

  const hasCreatedAssistant = useRef(false);
  /* eslint-disable */
  const createAssistantAndThread = async (_instance: Instances) => {
    if (!_instance) return;
    hasCreatedAssistant.current = true;
    const currentFormattedDate = formatDate(new Date());

    setMessages([]);

    try {
      const newAssistant = await openai.beta.assistants.create({
        name: `${_instance.id}:${_instance.domain}:${currentFormattedDate}`,
        description: `Domain: ${_instance.domain} - Instance ID: ${_instance.id}`,
        instructions: Prompts(),
        tools: Tools,
        model: 'gpt-3.5-turbo-0125',
      });

      setAssistant(newAssistant);

      const nThread = await openai.beta.threads.create();
      setThread(nThread);

      await createNewAssistant({
        variables: {
          instance_id: _instance.id,
          user_id: user?.id,
          assistant: newAssistant,
          thread: nThread,
        },
        refetchQueries: [{ query: GetInstancesQuery }],
      });
    } catch (error) {
      console.error(error);
    }
  };
  /* eslint-enable */

  const initAssistant = useCallback(async () => {
    if (instance?.openai_assistants && instance.openai_assistants.length > 0) {
      const sortedAssistants = [...instance.openai_assistants].sort((a, b) => {
        return (
          new Date(b.assistant.created_at).getTime() -
          new Date(a.assistant.created_at).getTime()
        );
      });

      const lastAssistant = sortedAssistants[0];
      setActiveAssistant(lastAssistant);
      setAssistant(lastAssistant.assistant);
      setThread(lastAssistant.thread);

      if (isAssistantOutdated(lastAssistant as unknown as Assistant)) {
        await openai.beta.assistants.del(lastAssistant.assistant.id);
        await deleteInstanceOldAssistant(instance.id);
        createAssistantAndThread(instance);
      }
    } else if (!assistant && !hasCreatedAssistant.current) {
      if (instance) createAssistantAndThread(instance);
    }
  }, [
    assistant,
    createAssistantAndThread,
    deleteInstanceOldAssistant,
    instance,
    openai.beta.assistants,
  ]);

  useEffect(() => {
    if (instance) {
      initAssistant();
    }
  }, [initAssistant, instance]);

  useEffect(() => {
    setMessages(
      JSON.parse((activeAssistant?.messages as unknown as string) || '[]')
    );
  }, [activeAssistant]);

  /**
   * Messaging
   */

  const handleSend = async (message: string) => {
    if (!thread || !assistant) return;
    setIsTyping(true);
    const newMessage: MessageModel = {
      position: 'last',
      message,
      sender: user?.id,
      sentTime: String(Number(Date.now())),
      direction: 'outgoing' as MessageDirection,
    };

    setMessages([...messages, newMessage]);

    try {
      await openai.beta.threads.messages
        .create(thread!.id, {
          role: 'user',
          content: message as string,
        })
        .then(async () => {
          const rAssistant: Assistant = await openai.beta.assistants.retrieve(
            assistant!.id
          );
          const rThread: Thread = await openai.beta.threads.retrieve(
            thread!.id
          );

          let nRun = await openai.beta.threads.runs.create(rThread.id, {
            assistant_id: rAssistant.id,
          });
          /* eslint-disable */
          while (
            nRun!.status !== 'completed' &&
            nRun!.status !== 'requires_action'
          ) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            nRun = await openai.beta.threads.runs.retrieve(
              rThread!.id,
              nRun!.id
            );
          }

          if (nRun.status === 'requires_action' && nRun.required_action) {
            for (const tool_call of nRun.required_action.submit_tool_outputs
              .tool_calls) {
              switch (tool_call.function.name) {
                case 'instance':
                  const instanceOutput = await getSingleInstance;
                  await openai.beta.threads.runs.submitToolOutputs(
                    rThread!.id,
                    nRun!.id,
                    {
                      tool_outputs: [
                        {
                          tool_call_id: tool_call.id,
                          output: instanceOutput,
                        },
                      ],
                    }
                  );
                  break;
                case 'query_google_analytics':
                  const gaOutput = await queryGoogleAnalytics(
                    gaConnect,
                    newMessage,
                    messages
                  );
                  await openai.beta.threads.runs.submitToolOutputs(
                    rThread!.id,
                    nRun!.id,
                    {
                      tool_outputs: [
                        {
                          tool_call_id: tool_call.id,
                          output: gaOutput,
                        },
                      ],
                    }
                  );
                  break;
                default:
                  break;
              }
            }
          }

          // Continuation of your existing code to handle the response...
          while (nRun!.status !== 'completed') {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            nRun = await openai.beta.threads.runs.retrieve(
              rThread!.id,
              nRun!.id
            );
          }
          /* eslint-enable */

          await openai.beta.threads.messages
            .list(rThread.id)
            .then(async (aiMessages) => {
              if ('text' in aiMessages.data[0].content[0]) {
                const newAIMessage: MessageModel = {
                  message: aiMessages.data[0].content[0].text.value,
                  sender: 'Telow',
                  sentTime: String(Date.now()),
                  direction: 'incoming' as MessageDirection,
                  position: 'last',
                };

                const response: MessageModel[] = [
                  ...messages,
                  newMessage,
                  newAIMessage,
                ];
                setMessages(response);
                setIsTyping(false);
                const messagesJson = JSON.stringify(response);

                await updateAssistantMessages({
                  variables: {
                    id: activeAssistant!.id,
                    messages: messagesJson,
                    instance_id: instance?.id,
                    user_id: user?.id,
                  },
                  refetchQueries: [{ query: GetInstancesQuery }],
                });
              }
            });
        });
    } catch (error: unknown) {
      console.error(error);
      setIsTyping(false);
    }
  };

  /**
   * Chat UI
   */

  useEffect(() => {
    if (messageListRef.current) {
      const messageListElement = messageListRef.current;
      messageListElement.scrollTop = messageListElement.scrollHeight;
    }
  }, [messages]);

  return (
    <Grid templateColumns="repeat(12, 1fr)">
      <GridItem colSpan={12}>
        <MainContainer className="main-container">
          <ChatContainer>
            <MessageList
              ref={messageListRef}
              autoScrollToBottom
              autoScrollToBottomOnMount
              id="message-list"
              className="message-list-custom"
              scrollBehavior="auto"
              typingIndicator={isTyping ? <TypingIndicator content="" /> : null}
            >
              <Message
                key={placeholderMessage.sentTime}
                model={placeholderMessage}
              >
                <Message.CustomContent>
                  <Avatar size="md" src={TelowLogoGreen} name="Telow" />
                  <Box style={{ alignContent: 'center' }}>
                    {placeholderMessage.message}
                  </Box>
                </Message.CustomContent>
              </Message>
              {messages &&
                messages.map((message: MessageModel) => {
                  return (
                    <Message
                      className={
                        message.direction === 'incoming'
                          ? 'custom-incoming'
                          : 'custom-outgoing'
                      }
                      key={`${message.sentTime}-${message.sender}`}
                      model={{
                        sentTime: message.sentTime,
                        sender: message.sender,
                        direction: 'incoming',
                        position: message.position,
                      }}
                    >
                      <Message.CustomContent>
                        {message.direction === 'incoming' ? (
                          <Avatar size="md" src={TelowLogoGreen} name="Telow" />
                        ) : (
                          <Avatar
                            size="md"
                            src={user?.picture ? user?.picture : ''}
                            name={user?.given_name ? user?.given_name : ''}
                          />
                        )}

                        <MarkdownRenderer
                          markdownText={message.message ? message.message : ''}
                        />
                      </Message.CustomContent>
                      <Message.Footer />
                    </Message>
                  );
                })}
            </MessageList>
            <MessageInput
              attachButton={false}
              style={{
                fontSize: '14px',
                paddingBottom: '40px',
              }}
              placeholder={`How can I help you ${user?.given_name}?`}
              onSend={handleSend}
            />
          </ChatContainer>
          <Box className="add-button">
            <Button
              boxShadow="lg"
              position="absolute"
              right={5}
              top={5}
              onClick={() => {
                if (instance) {
                  createAssistantAndThread(instance).catch(console.error);
                } else {
                  console.error('Instance is undefined or not selected.');
                }
              }}
            >
              <IoAdd size={25} color="#b4d455" /> <Text ml={1}>New Chat</Text>
            </Button>
          </Box>
        </MainContainer>
      </GridItem>
    </Grid>
  );
};

export default Chat;
