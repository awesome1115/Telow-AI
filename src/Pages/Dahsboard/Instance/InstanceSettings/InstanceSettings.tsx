import React, { FC, useEffect } from 'react';
import './InstanceSettings.scss';
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Grid,
  GridItem,
  Heading,
  IconButton,
  useClipboard,
  useToast,
} from '@chakra-ui/react';
import { IoClipboard, IoClipboardOutline } from 'react-icons/io5';
import DeleteInstance from './DeleteInstance/DeleteInstance';
import useActiveInstanceStore from '../../../../States/instancesStore';

interface InstanceSettingsProps {}

const InstanceSettings: FC<InstanceSettingsProps> = () => {
  const activeInstance = useActiveInstanceStore((state) => state.instance);
  const { onCopy, value, setValue, hasCopied } = useClipboard('');
  const toast = useToast();

  useEffect(() => {
    setValue(activeInstance!.id);
  });

  const InstanceIDCopied = () => {
    onCopy();
    toast({
      title: 'Instance ID Copied.',
      status: 'success',
      duration: 9000,
      isClosable: true,
    });
  };
  return (
    <Box p="25px" pl={{ base: 25, md: 90 }} pt={20} height="100%">
      <Heading size="sm" mb={3} color="gray.400">
        Instance ID:
      </Heading>
      <ButtonGroup
        size="sm"
        isAttached
        variant="outline"
        onClick={InstanceIDCopied}
      >
        <Button
          color="gray.400"
          fontSize={13}
          fontWeight="400"
          borderColor="gray.400"
          fontFamily="monospace"
        >
          {value}
        </Button>
        <IconButton
          borderColor="gray.400"
          aria-label="Add to friends"
          color="#fff"
          icon={hasCopied ? <IoClipboard /> : <IoClipboardOutline />}
        />
      </ButtonGroup>
      <Divider borderColor="black" my={9} />
      <Grid templateColumns="repeat(12, 1fr)">
        <GridItem colSpan={{ base: 12, md: 6 }}>
          <DeleteInstance />
        </GridItem>
      </Grid>
    </Box>
  );
};

export default InstanceSettings;
