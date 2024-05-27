import {
  Card,
  CardBody,
  CardFooter,
  SimpleGrid,
  Text,
  Image,
  Box,
  Input,
} from '@chakra-ui/react';
import React, { FC, SetStateAction, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGesture } from 'react-use-gesture';
import GoogleAnalyticsIcon from '@assets/thirdparty/google-analytics.svg';
import { Instances } from '../../../API/Model/InstancesModel';
import useActiveInstanceStore from '../../../States/instancesStore';
import './InstanceCard.scss';

interface InstanceCardProps {
  instances: Instances[];
}

const InstanceCard: FC<InstanceCardProps> = ({ instances }) => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const addActiveInstance = useActiveInstanceStore(
    (state) => state.addInstance
  );

  const handleCardClick = (instanceId: SetStateAction<string>) => {
    const selected = instances!.find((inst) => inst.id === instanceId);
    if (selected) {
      addActiveInstance(selected);
      navigate(`instance/${instanceId}/chat`);
    }
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const bind = useGesture({
    onDrag: ({
      movement: [mx],
      memo = scrollContainerRef.current?.scrollLeft,
    }) => {
      if (scrollContainerRef.current) {
        const newX = memo - mx;
        scrollContainerRef.current.scrollLeft = newX;
      }
      return memo;
    },
  });

  const filteredInstances = useMemo(() => {
    if (!searchTerm) return instances;
    return instances.filter((instance: { domain: string }) =>
      instance.domain.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [instances, searchTerm]);

  return (
    <>
      <Box px={4}>
        <Input
          ref={searchInputRef}
          display="inline"
          placeholder="Search Instance"
          size="md"
          borderRadius="full"
          mb={3}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>
      <div
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...bind()}
        ref={scrollContainerRef}
        style={{
          overflowX: 'auto',
          cursor: 'grab',
          display: 'flex',
          gap: '16px',
          padding: '16px',
          whiteSpace: 'nowrap',
        }}
        className="hide-scrollbar"
      >
        {filteredInstances.length > 0 ? (
          filteredInstances!.map((instance) => (
            <Card
              border="1px solid #e3e3e3"
              minW="min-content"
              boxShadow="lg"
              key={instance.id}
              onClick={() => handleCardClick(instance.id)}
              cursor="pointer"
            >
              <CardBody>
                <Text fontWeight={700} fontSize={14}>
                  {instance.domain}
                </Text>
              </CardBody>
              {instance.ga_connect && (
                <CardFooter pt={1}>
                  <SimpleGrid>
                    <Image
                      src={GoogleAnalyticsIcon}
                      width="15px"
                      height="15px"
                      mr={3}
                    />
                  </SimpleGrid>
                </CardFooter>
              )}
            </Card>
          ))
        ) : (
          <Text>No instances found</Text>
        )}
      </div>
    </>
  );
};

export default InstanceCard;
