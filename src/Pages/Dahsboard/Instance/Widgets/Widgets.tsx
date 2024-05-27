import React, { FC } from 'react';
import { Box, Divider } from '@chakra-ui/react';
import { Instances } from '../../../../API/Model/InstancesModel';
import GAConnectWidget from './Connects/GA';

interface WidgetsProps {
  instance?: Instances;
}

const Widgets: FC<WidgetsProps> = ({ instance }) => {
  return (
    <Box p={5}>
      {instance!.ga_connect && (
        <>
          <GAConnectWidget />
          <Divider borderColor="#323232" />
        </>
      )}
    </Box>
  );
};

export default Widgets;
