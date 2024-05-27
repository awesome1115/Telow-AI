import {
  Popover,
  ListItem,
  Avatar,
  AvatarBadge,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import React, { FC, useEffect, useState } from 'react';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { NavLink } from 'react-router-dom';
import { HeadlessService, FetchResult, ISession } from '@novu/headless';
import { useAuthorizer } from '@authorizerdev/authorizer-react';
import Notifications from '../Notifications';

interface MenuItemNotificationProps {
  popover?: boolean;
}

const MenuItemNotification: FC<MenuItemNotificationProps> = (props) => {
  const [unseenCount, setUnseenCount] = useState<number>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuthorizer();
  const toast = useToast();

  const notificationHandler = () => {
    isOpen ? onClose() : onOpen();
  };

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
          // Fetch First Unseen
          headlessService.fetchUnseenCount({
            listener: (result: FetchResult<{ count: number }>) => {},
            onSuccess: (data: { count: number }) => {
              setUnseenCount(data.count);
            },
          });
          // Update Unseen Number Real-Time
          headlessService.listenUnseenCountChange({
            listener: (unseenCount: number) => {
              setUnseenCount(unseenCount);
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

  return (
    <>
      {props.popover ? (
        <Popover trigger="hover" placement="right">
          <ListItem onClick={notificationHandler} cursor="pointer">
            <NavLink to="#">
              <Avatar
                size="sm"
                icon={<IoIosNotificationsOutline fontSize="1.25rem" />}
                background="#fff"
                color="#000"
              >
                <AvatarBadge p={2} boxSize="1.75em" bg="red.500" color="white">
                  {unseenCount}
                </AvatarBadge>
              </Avatar>
            </NavLink>
            <Drawer
              placement="left"
              onClose={onClose}
              isOpen={isOpen}
              size="sm"
            >
              <DrawerOverlay />
              <DrawerContent>
                <Notifications />
              </DrawerContent>
            </Drawer>
          </ListItem>
        </Popover>
      ) : (
        <ListItem onClick={notificationHandler} cursor="pointer">
          <NavLink to="#">
            <Avatar
              size="sm"
              icon={<IoIosNotificationsOutline fontSize="1.25rem" />}
              backgroundColor="#000"
            >
              <AvatarBadge p={2} boxSize="1.75em" bg="red.500">
                {unseenCount}
              </AvatarBadge>
            </Avatar>
          </NavLink>
          <Drawer placement="left" onClose={onClose} isOpen={isOpen} size="sm">
            <DrawerOverlay />
            <DrawerContent>
              <Notifications />
            </DrawerContent>
          </Drawer>
        </ListItem>
      )}
    </>
  );
};

export default MenuItemNotification;
