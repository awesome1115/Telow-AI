import { Box, Heading, Text } from '@chakra-ui/react';
import React, { FC } from 'react';
import { RiHistoryFill } from 'react-icons/ri';
import moment from 'moment';
import { Instances } from '../../../../../API/Model/InstancesModel';

interface HistoryProps {
  instance: Instances | null;
}

const ChatHistory: FC<HistoryProps> = ({ instance }) => {
  return (
    <Box p="15px" background="#000" textAlign="left">
      <Heading
        size="sm"
        color="white"
        display="flex"
        mb={3}
        alignItems="self-end"
      >
        <RiHistoryFill /> <Box ml={1}>Chats</Box>
      </Heading>
      {instance?.openai_assistants?.map((assistant) => {
        if (!assistant.messages) return null;
        const randomMessage = JSON.parse(
          assistant.messages as unknown as string
        )[
          Math.floor(
            Math.random() *
              JSON.parse(assistant.messages as unknown as string).length
          )
        ];

        return (
          <Box
            key={assistant.id}
            color="white"
            mt={2}
            fontSize={15}
            background="#1f1f1f"
            p={3}
            borderRadius={7}
          >
            {assistant.created_at
              ? moment(assistant.created_at).fromNow()
              : 'just now'}{' '}
            -{' '}
            {randomMessage.message.split(' ').length > 5
              ? `${randomMessage.message.split(' ').slice(0, 4).join(' ')}...`
              : randomMessage.message}
            <Text fontSize={10} color="#929292">
              {assistant.created_at &&
                moment(assistant.created_at).format('ddd, MMMM Do, YYYY')}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};

export default ChatHistory;
