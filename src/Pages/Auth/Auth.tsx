import React, { FC } from 'react';
import { Authorizer } from '@authorizerdev/authorizer-react';
import {
  Box,
  Card,
  CardBody,
  Divider,
  Flex,
  Text,
  Grid,
  GridItem,
  Heading,
  Image,
  Button,
  List,
  ListItem,
} from '@chakra-ui/react';
import './Auth.scss';
import { Link } from 'react-router-dom';
import { HiOutlineDocumentText } from 'react-icons/hi2';
import { FiHome } from 'react-icons/fi';
import Logo from '@assets/images/telow-logo.svg';
import MenuSidebar from '../../Shared/SideMenu/SideMenu';

interface AuthProps {}

const Auth: FC<AuthProps> = () => {
  document.title = 'Login | Telow';
  return (
    <Box fontWeight={500} bg="white" height="100vh">
      <Grid templateColumns="repeat(13, 1fr)" gap={5}>
        <GridItem
          colSpan={{ base: 13, md: 1 }}
          as="aside"
          justifyContent="space-between"
          borderBottom={{ base: '1px solid #ccc', md: 'none' }}
          py={{ base: '15px', md: '45px' }}
          alignItems={{ base: 'left' }}
          px={{ base: '30px', md: '0px' }}
          zIndex={2}
        >
          <MenuSidebar
            divider
            menuItems={[
              {
                name: 'Home',
                icon: FiHome,
                route: 'https://telow.com',
                handler: () => {},
                external: true,
              },
            ]}
            bottomIcons={[
              {
                name: 'Documentation',
                icon: HiOutlineDocumentText,
                route: 'https://docs.telow.com',
                handler: () => {},
                external: true,
              },
            ]}
          />
        </GridItem>
        <GridItem
          p="25px"
          colSpan={{ base: 12, lg: 5, xl: 6 }}
          backgroundPosition="55%"
          backgroundSize="cover"
          position="relative"
          alignContent="center"
        >
          <Flex>
            <Link to="https://telow.com">
              <Image maxWidth="150px" src={Logo} />
            </Link>
          </Flex>
          <Box
            zIndex={1}
            position="relative"
            display={{ base: 'none', lg: 'initial' }}
          >
            <Box mt={40} pl={30}>
              <Text
                fontSize="xl"
                fontWeight="bold"
                display="flex"
                alignItems="center"
                zIndex={2}
                position="relative"
              >
                <Box as="span" height="2px" width="8" bg="black" mr="2" />
                Artificial Intelligence
              </Text>
              <Heading
                fontSize="5rem"
                lineHeight="4rem"
                position="relative"
                zIndex={2}
              >
                Business Intelligence for Everyone
              </Heading>
              <Link to="https://telow.com/features/" target="_blank">
                <Button
                  zIndex={2}
                  mt={10}
                  colorScheme="blackAlpha"
                  bg="black"
                  color="white"
                  px="10"
                  py="6"
                  borderRadius="5px" // Fully rounded corners
                  _hover={{ bg: 'blackAlpha.800' }} // Adjust hover state color
                  rightIcon={
                    <Box as="span" height="1px" width="8" bg="white" />
                  } // Right icon as a custom component
                >
                  Learn Now
                </Button>
              </Link>
            </Box>
            <Box
              marginLeft="-200px"
              top={-40}
              transform="rotate(-30deg)"
              position="absolute"
              zIndex={0}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="873.984"
                height="706.607"
                viewBox="0 0 873.984 706.607"
              >
                <path
                  id="Path_2"
                  data-name="Path 2"
                  d="M618,0c341.312,0,618,263.955,618,589.56s-276.688-131.45-618-131.45S276.688,0,618,0Z"
                  transform="translate(-362.016)"
                  fill="#e8ffbe"
                />
              </svg>
            </Box>
          </Box>
        </GridItem>
        <GridItem
          colSpan={{ base: 13, md: 13, lg: 7, xl: 6 }}
          alignContent="center"
          p="25px"
        >
          <Box
            m="auto"
            position="relative"
            zIndex={2}
            maxWidth="500px"
            mt={{ base: 0, md: 150 }}
          >
            <Card shadow="xl" borderRadius="20px" p={5}>
              <CardBody>
                <Heading size="lg">Login Now</Heading>
                <Text mt={2} color="#7c7c7c">
                  Use providers below to login and create account.
                </Text>

                <Divider mt={5} mb={5} />
                <Authorizer />
              </CardBody>
            </Card>
          </Box>
        </GridItem>
      </Grid>
      <Box position="relative" textAlign="center" p="25px" pt={{ md: 100 }}>
        <List display="flex" justifyContent="center" gap={4}>
          <ListItem fontWeight={600}>
            <Link to="https://telow.com/terms-conditions/" target="_blank">
              Term & Conditions
            </Link>
          </ListItem>
          <ListItem fontWeight={600}>
            <Link to="https://telow.com/privacy-policy/" target="_blank">
              Privacy
            </Link>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default Auth;
