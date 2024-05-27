import './Notifications.scss';
import {
  Button,
  DrawerBody,
  DrawerCloseButton,
  DrawerHeader,
  Flex,
  Grid,
  GridItem,
  ListItem,
  OrderedList,
  useToast,
} from '@chakra-ui/react';
import React, { FC, useEffect, useState } from 'react';
import { useAuthorizer } from '@authorizerdev/authorizer-react';
import { HeadlessService, FetchResult, ISession } from '@novu/headless';
import { Novu } from '@novu/node';
import { AiOutlineDelete } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import NotificationItem from './NotificationItem/NotificationItem';

interface NotificationsProps {}

const Notifications: FC<NotificationsProps> = () => {
  const { user } = useAuthorizer();
  const [messages, setMessages] = useState<any>([]);
  const [unseenCount, setUnseenCount] = useState<number>();
  const toast = useToast();
  const novu = new Novu(import.meta.env.VITE_NOVU_API_KEY as string, {
    backendUrl: 'https://api-notifications.telow.com',
  });

  const headlessService = new HeadlessService({
    applicationIdentifier: import.meta.env.VITE_NOVU_IDENTIFIER as string,
    subscriberId: user?.id,
    backendUrl: 'https://api-notifications.telow.com',
    socketUrl: 'https://ws-notifications.telow.com',
  });

  useEffect(() => {
    headlessService.initializeSession({
      listener: (res: FetchResult<ISession>) => {},
      onSuccess: (session: ISession) => {
        if (session) {
          headlessService.fetchUnseenCount({
            listener: (result: FetchResult<{ count: number }>) => {},
            onSuccess: (data: { count: number }) => {
              setUnseenCount(data.count);
            },
          });
          headlessService.listenUnseenCountChange({
            listener: (unseenCount: number) => {
              setUnseenCount(unseenCount);
            },
          });
          headlessService.fetchNotifications({
            listener: (result: FetchResult<any>) => {},
            onSuccess: (response: any) => {
              setMessages(response.data);
            },
          });
          headlessService.listenNotificationReceive({
            listener: (message: any) => {
              setMessages((messages: any) => [message, ...messages]);
            },
          });
        }
      },
      onError: (error) => {
        console.error(error);
        toast({
          title: 'Notifications',
          description: error as string,
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      },
    });
  }, []);

  const deleteNotification = async (id: string) => {
    await novu.messages.deleteById(id);
    const removingArr = [...messages];
    removingArr.splice(
      removingArr.findIndex((item) => item.id === id),
      1
    );
    setMessages(removingArr);
  };

  return (
    <>
      <DrawerCloseButton />
      <DrawerHeader>
        All Notifications{' '}
        {unseenCount && unseenCount > 0 ? `(${unseenCount})` : ''}
      </DrawerHeader>
      <DrawerBody p={0}>
        <OrderedList listStyleType="none" margin={0}>
          {messages &&
            messages.map((message: any) => {
              return (
                <Link
                  to={`/instance/${message.payload.instance_id}/bugs/item/${message.payload.id}`}
                >
                  <ListItem
                    borderBottom="1px solid #e7e7e7"
                    background={message.read ? 'white' : '#fafbfd'}
                    p="25px"
                    backgroundColor={message.active ? '#f0f4fc' : 'none'}
                  >
                    <Grid
                      templateColumns="repeat(12, 1fr)"
                      gridTemplateRows="min-content"
                    >
                      <NotificationItem key={message.id} message={message} />
                      <GridItem colSpan={12}>
                        <Flex justifyContent="flex-end" width="100%">
                          <Button
                            backgroundColor="white"
                            mt={5}
                            onClick={() => {
                              deleteNotification(message.id);
                            }}
                          >
                            <AiOutlineDelete />
                          </Button>
                        </Flex>
                      </GridItem>
                    </Grid>
                  </ListItem>
                </Link>
              );
            })}
        </OrderedList>
      </DrawerBody>
    </>
  );
};

export default Notifications;
