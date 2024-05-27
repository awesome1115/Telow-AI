import React, { FC } from 'react';
import './SideMenu.scss';
import {
  As,
  Divider,
  List,
  ListIcon,
  ListItem,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Stack,
  VisuallyHidden,
} from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

interface MenuItem {
  name: string;
  icon: As;
  route?: string;
  handler: () => void;
  external?: boolean;
  popoverComponent?: JSX.Element;
}

interface MenuSidebarProps {
  menuItems: MenuItem[];
  bottomIcons?: MenuItem[];
  divider: boolean;
  iconColor?: string;
  popOverBackgroundColor?: string;
  enablePopover?: boolean;
}

const MenuSidebar: FC<MenuSidebarProps> = ({
  menuItems,
  bottomIcons,
  divider,
  iconColor,
  popOverBackgroundColor,
  enablePopover,
}) => {
  const renderLink = (item: MenuItem) => {
    if (item.route) {
      return item.external ? (
        <a href={item.route} target="_blank" rel="noopener noreferrer">
          <ListIcon as={item.icon} fontSize="22px" />
          <VisuallyHidden>{item.name}</VisuallyHidden>
        </a>
      ) : (
        <NavLink to={item.route}>
          <ListIcon as={item.icon} fontSize="22px" />
          <VisuallyHidden>{item.name}</VisuallyHidden>
        </NavLink>
      );
    }
    return (
      <span>
        <ListIcon as={item.icon} fontSize="22px" />
        <VisuallyHidden>{item.name}</VisuallyHidden>
      </span>
    );
  };

  return (
    <List spacing={6} textAlign="center" color={iconColor}>
      <Stack
        direction={{ base: 'row', md: 'column' }}
        gap={7}
        justifyContent="flex-start"
      >
        {menuItems &&
          menuItems.map((item) => {
            return (
              <Popover key={item.name} trigger="hover" placement="auto">
                <PopoverTrigger>
                  <ListItem onClick={item.handler} cursor="pointer">
                    {item.route ? (
                      <NavLink to={item.route}>
                        <ListIcon margin={0} as={item.icon} fontSize="22px" />
                      </NavLink>
                    ) : (
                      <ListIcon margin={0} as={item.icon} fontSize="22px" />
                    )}
                  </ListItem>
                </PopoverTrigger>
                {enablePopover && (
                  <PopoverContent>
                    <PopoverArrow />
                    <PopoverBody>{item.name}</PopoverBody>
                  </PopoverContent>
                )}
                {item.popoverComponent && (
                  <PopoverContent borderColor="black">
                    <PopoverArrow
                      bg="black"
                      border="black"
                      boxShadow="-1px -1px 1px 0 black !important"
                    />
                    <PopoverBody background="#000">
                      {React.isValidElement(item.popoverComponent) &&
                        item.popoverComponent}
                    </PopoverBody>
                  </PopoverContent>
                )}
              </Popover>
            );
          })}
        {divider && <Divider borderColor={iconColor} opacity={0.2} />}
        {bottomIcons &&
          bottomIcons.map((icon) => (
            <Popover key={icon.name} trigger="hover" placement="auto">
              <PopoverTrigger>
                <ListItem onClick={icon.handler} cursor="pointer">
                  {renderLink(icon)}
                </ListItem>
              </PopoverTrigger>
              {enablePopover && (
                <PopoverContent background={popOverBackgroundColor}>
                  <PopoverArrow />
                  <PopoverBody>{icon.name}</PopoverBody>
                </PopoverContent>
              )}
            </Popover>
          ))}
      </Stack>
    </List>
  );
};

export default MenuSidebar;
