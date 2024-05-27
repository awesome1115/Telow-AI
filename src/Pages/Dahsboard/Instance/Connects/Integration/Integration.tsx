import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  useDisclosure,
  Image,
  ModalHeader,
  ModalFooter,
  Text,
} from '@chakra-ui/react';
import { FC } from 'react';
import { Instances } from '../../../../../API/Model/InstancesModel';

interface IntegrationProps {
  name: string;
  svgIcon?: string;
  AuthViewComponent?: FC;
  instance?: Instances;
}

const Integration: FC<IntegrationProps> = ({
  name,
  svgIcon,
  AuthViewComponent,
  instance,
}) => {
  const AuthComponent = AuthViewComponent || (() => null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button
        size="md"
        m={2}
        justifyContent="flex-start"
        onClick={() => {
          onOpen();
        }}
        variant="outline"
        background="white"
        boxShadow="lg"
        className="addInstance"
      >
        <Flex textAlign="left">
          <Image src={svgIcon} width="20px" height="20px" mr={3} />
          {name}
        </Flex>
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent mx={5} className="addInstanceInput">
          <ModalHeader
            borderBottom="1px solid #ebebeb"
            display="flex"
            alignItems="center"
          >
            <Image src={svgIcon} width="20px" height="20px" mr={3} /> {name}{' '}
            Connection
          </ModalHeader>
          <ModalBody>
            <Text display="block" fontSize="14px" mb={2} fontWeight={800}>
              {instance?.domain}
            </Text>
            <p
              color="#858585"
              style={{
                fontSize: '0.9rem',
                color: '#6e6e6ecc',
              }}
            >
              Allow Telow to access your {name} data, proceed with the account
              authentication process below.
            </p>
          </ModalBody>
          <ModalFooter>
            <AuthComponent />
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Integration;
