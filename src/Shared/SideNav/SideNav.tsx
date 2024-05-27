import {
  Box,
  BoxProps,
  Flex,
  FlexProps,
  Icon,
  Image,
  useDisclosure,
  Divider,
  Avatar,
  Text,
  IconButton,
} from '@chakra-ui/react';
import React, { FC, ReactNode } from 'react';
import { IconType } from 'react-icons';
import {
  HiOutlineChatBubbleLeft,
  HiOutlineWallet,
  HiOutlineDocumentText,
} from 'react-icons/hi2';
import { IoMdLogOut } from 'react-icons/io';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '@assets/images/White_logo_no_background.svg';
import LogoHead from '@assets/images/Telow-White-Head.svg';
import { useAuthorizer } from '@authorizerdev/authorizer-react';
import { RiMenuFoldLine, RiMenuUnfoldLine } from 'react-icons/ri';

interface SideNavProps {
  children: ReactNode;
}

const SideNav: FC<SideNavProps> = ({ children }) => {
  const { isOpen, onToggle } = useDisclosure();

  const { user, setUser, setToken, authorizerRef } = useAuthorizer();
  const route = useNavigate();
  const location = useLocation();

  const logout = () => {
    authorizerRef.logout();
    setUser(null);
    setToken(null);
    route('/');
  };

  interface LinkItemProps {
    name: string;
    icon?: IconType;
    route?: string;
    handler?: () => void;
    external?: boolean;
    position?: string;
  }
  const LinkItems: Array<LinkItemProps> = [
    {
      name: 'Dashboard',
      icon: HiOutlineChatBubbleLeft,
      route: '/instance',
      handler: () => {},
    },

    {
      name: 'Subscription',
      icon: HiOutlineWallet,
      route: '/settings/billing',
      handler: () => {},
    },
    {
      name: 'Documentation',
      icon: HiOutlineDocumentText,
      route: 'https://docs.telow.com',
      handler: () => {},
      external: true,
      position: 'bottom',
    },
    {
      name: 'Logout',
      icon: IoMdLogOut,
      route: '#',
      handler: logout,
      position: 'bottom',
    },
  ];

  const normalLinkItems = LinkItems.filter(
    (item) => item.position !== 'bottom'
  );
  const bottomLinkItems = LinkItems.filter(
    (item) => item.position === 'bottom'
  );

  interface SidebarProps extends BoxProps {
    onClose: () => void;
  }

  interface NavItemProps extends FlexProps {
    icon?: IconType;
    children: ReactNode;
    route: string;
  }

  // eslint-disable-next-line react/no-unstable-nested-components, @typescript-eslint/no-shadow
  const NavItem = ({ icon, children, route, ...rest }: NavItemProps) => {
    const active = location.pathname.startsWith(route);
    return (
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <Flex
        align="center"
        p="4"
        py={3}
        my={2}
        mx="4"
        w={isOpen ? 'auto' : '3.2rem'}
        transition="0.2s all"
        borderRadius="full"
        role="group"
        cursor="pointer"
        bg={active ? 'white' : 'transparent'}
        color={active ? 'black' : 'white'}
        border={active ? '1px solid #465467' : '1px solid transparent'}
        _hover={{
          color: 'black',
          borderRadius: 'full',
          border: '1px solid #465467',
        }}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: 'grey',
            }}
            as={icon}
          />
        )}
        <Text visibility={isOpen ? 'visible' : 'hidden'}>{children}</Text>
      </Flex>
    );
  };

  // eslint-disable-next-line react/no-unstable-nested-components, @typescript-eslint/no-shadow
  const BottomNavItem = ({ icon, children, route, ...rest }: NavItemProps) => {
    const active = location.pathname.startsWith(route);
    return (
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <Flex
        align="center"
        p="4"
        py={3}
        my={2}
        mx="4"
        borderRadius="full"
        role="group"
        transition="0.2s all"
        cursor="pointer"
        border={active ? '1px solid #465467' : '1px solid transparent'}
        _hover={{
          color: 'white',
        }}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            _groupHover={{
              color: 'grey',
            }}
            as={icon}
          />
        )}
        <Text visibility={isOpen ? 'visible' : 'hidden'}>{children}</Text>
      </Flex>
    );
  };

  // eslint-disable-next-line react/no-unstable-nested-components, @typescript-eslint/no-shadow
  const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
    return (
      <Box
        transition="3s ease"
        w={{ base: 'full', md: 60 }}
        pos="fixed"
        h="full"
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...rest}
      >
        {isOpen ? (
          <Flex
            h="20"
            alignItems="center"
            mx="8"
            justifyContent="space-between"
          >
            <Link to="/">
              <Image maxWidth="120px" src={Logo} />
            </Link>
          </Flex>
        ) : (
          <Flex
            h="20"
            mt="3.5rem"
            alignItems="center"
            mx="8"
            marginInlineStart={6}
            justifyContent="space-between"
          >
            <Link to="/">
              <Image width="35px" src={LogoHead} />
            </Link>
          </Flex>
        )}
        <Box>
          {normalLinkItems.map((link) => (
            <Link key={link.name} to={link.route as string}>
              <NavItem
                route={link.route as string}
                key={link.name}
                icon={link.icon}
                fontWeight={500}
                onClick={link.handler}
              >
                {link.name}
              </NavItem>
            </Link>
          ))}
        </Box>
        <Box bottom={65} position="inherit">
          <Divider ml={3} borderColor="#465467" my={3} />
          <Link to="/settings/profile">
            <Flex
              align="center"
              p="4"
              py={3}
              my={2}
              mx="4"
              borderRadius="full"
              role="group"
              transition="0.2s all"
              cursor="pointer"
              color={isOpen ? 'white' : 'transparent'}
              _hover={{
                color: 'white',
              }}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...rest}
            >
              <Avatar
                size="xs"
                marginRight={3}
                name={`${user?.given_name} ${user?.family_name}`}
                src={user?.picture ? user?.picture : ''}
              />
              <Text display="inline" color={isOpen ? 'white' : 'transparent'}>
                {user?.given_name} {user?.family_name}
              </Text>
            </Flex>
          </Link>
          {bottomLinkItems.map((link) => (
            <Link key={link.name} to={link.route as string}>
              <BottomNavItem
                route={link.route as string}
                key={link.name}
                icon={link.icon}
                color="#ebeaef"
                fontWeight={500}
                onClick={link.handler}
              >
                {link.name}
              </BottomNavItem>
            </Link>
          ))}
        </Box>
      </Box>
    );
  };
  return (
    <Box minH="100vh">
      <SidebarContent
        onClose={() => onToggle()}
        display={{ base: 'none', md: 'block' }}
      />
      <Box
        transition="all 0.5s"
        ml={{ base: 0, md: isOpen ? '15em' : '4.6rem' }}
      >
        <IconButton
          shadow="lg"
          height="50px"
          width="50px"
          bg="white"
          marginLeft="-1.5rem"
          icon={<Icon as={isOpen ? RiMenuFoldLine : RiMenuUnfoldLine} />}
          onClick={onToggle}
          position="fixed"
          top="1rem"
          borderRadius="full"
          zIndex="overlay"
          aria-label=""
        />
        {children}
      </Box>
    </Box>
  );
};

export default SideNav;
