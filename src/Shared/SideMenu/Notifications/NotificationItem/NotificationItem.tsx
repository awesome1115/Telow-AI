import { Flex, GridItem, Heading, Text, useToast } from '@chakra-ui/react';
import React, { FC } from 'react';
import { Novu } from '@novu/node';
import { useAuthorizer } from '@authorizerdev/authorizer-react';
import moment from 'moment';

interface NotificationItemProps {
  message?: any;
  active?: boolean;
}

const NotificationItem: FC<NotificationItemProps> = (props) => {
  const { user } = useAuthorizer();
  const toast = useToast();
  const novu = new Novu(import.meta.env.VITE_NOVU_API_KEY as string, {
    backendUrl: 'https://api-notifications.telow.com',
  });

  const deleteNotification = async (id: string) => {
    await novu.messages.deleteById(id);
  };

  const goToBug = async (message: any) => {
    if (user) {
      const { data: markMessageAsRead } =
        await novu.subscribers.markMessageRead(user.id, message.id);
    }
  };

  return (
    <>
      {props.message && (
        <>
          <GridItem colSpan={1}>Type</GridItem>
          <GridItem colSpan={11} pl={3}>
            <Flex justifyContent="space-between">
              <Heading m={0} size="sm">
                {props.message.payload?.domain}
              </Heading>
              <small color="#ccc">
                {moment(props.message.payload.created_at).fromNow()}
              </small>
            </Flex>
            <Text fontSize="13px" mt={2}>
              {props.message.payload?.message}
            </Text>
          </GridItem>
        </>
      )}
    </>
  );
};

export default NotificationItem;
