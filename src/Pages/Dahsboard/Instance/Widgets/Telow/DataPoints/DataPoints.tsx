import { FC, useEffect, useState } from 'react';
import { Grid, GridItem, Heading, Text } from '@chakra-ui/react';
import numeral from 'numeral';
import { Instances } from '../../../../../../API/Model/InstancesModel';

interface DataPointsProps {
  instance: Instances | undefined;
}

const DataPoints: FC<DataPointsProps> = ({ instance }) => {
  const [attributesValueCount, setAttributesValueCount] = useState<number>(0);

  useEffect(() => {
    if (instance) {
      const totalValueCount = instance.bugs.reduce(
        (count, report) => count + Object.keys(report).length,
        0
      );
      setAttributesValueCount(totalValueCount);
    }
  }, [instance]);

  return (
    <Grid
      background="#FAFAFA"
      mx={3}
      borderRadius="7px"
      templateColumns="repeat(12, 1fr)"
    >
      {instance && (
        <>
          <GridItem
            colSpan={6}
            p={4}
            minHeight="155px"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            borderRight="1px solid #E2E8F0"
          >
            <Heading size="lg">
              {numeral(instance.bugs.length).format('0.00a')}
              <Text fontSize="md">POINTS</Text>
            </Heading>
            <Heading color="#6E6E6E" fontSize="lg">
              Data Collected
            </Heading>
          </GridItem>
          <GridItem
            colSpan={6}
            p={4}
            minHeight="155px"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <Heading size="lg">
              {numeral(attributesValueCount).format('0.00a')}
              <Text fontSize="md">ATTRIBUTES</Text>
            </Heading>
            <Heading color="#6E6E6E" fontSize="lg">
              Meta Extracted
            </Heading>
          </GridItem>
        </>
      )}
    </Grid>
  );
};

export default DataPoints;
