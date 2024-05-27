import {
  Box,
  Button,
  Grid,
  GridItem,
  Heading,
  Input,
  Text,
} from '@chakra-ui/react';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { IoIosSearch } from 'react-icons/io';
import Integration from './Integration/Integration';
import Integrations from './Integration/Integrations';
import { Instances } from '../../../../API/Model/InstancesModel';

interface ConnectsProps {
  instance?: Instances;
}

type IntegrationProps = {
  name: string;
  svgIcon: string;
  AuthViewComponent?: FC;
};

const Connects: FC<ConnectsProps> = ({ instance }) => {
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredIntegrations = useMemo(() => {
    if (!searchTerm) return Integrations;
    return Integrations.filter((integration: { name: string }) =>
      integration.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleOutsideClick = (e: MouseEvent) => {
    if (
      searchInputRef.current &&
      !searchInputRef.current.contains(e.target as Node)
    ) {
      setSearchOpen(false);
    }
  };

  useEffect(() => {
    if (searchOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [searchOpen]);

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  };

  return (
    <Grid templateColumns="repeat(24, 1fr)" px={3}>
      <GridItem colSpan={24} py={3}>
        <Heading display="inline" size="lg">
          Connects
        </Heading>
        {/* <Button
          bg="none"
          display="inline"
          _hover={{ bg: 'none' }}
          py={0}
          mt="-10px"
          borderRadius="full"
          onClick={toggleSearch}
        >
          <IoIosSearch />
        </Button>
        {searchOpen && (
          <Input
            ref={searchInputRef}
            display="inline"
            placeholder="Search connects"
            size="md"
            borderRadius="full"
            mb={3}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onBlur={() => setSearchOpen(false)}
          />
        )} */}
        {!searchOpen && (
          <Text color="#AFAFAF" fontSize="md">
            Leverage connects for insights on project logic with Telow, enabling
            smarter decisions.
          </Text>
        )}
        <Box mt={5}>
          {filteredIntegrations.map((integration: IntegrationProps) => (
            <Integration
              key={integration.name}
              name={integration.name}
              svgIcon={integration.svgIcon}
              instance={instance}
              AuthViewComponent={integration.AuthViewComponent}
            />
          ))}
        </Box>
      </GridItem>
    </Grid>
  );
};

export default Connects;
