import { Box, Grid, GridItem } from '@chakra-ui/react';
import React, { FC } from 'react';
import Lottie from 'lottie-react';
import Light404 from '@assets/lotties/light_404.json';
import Header from '../../Shared/Header/Header';

interface NotFoundProps {}

const NotFound: FC<NotFoundProps> = () => {
  return (
    <Box>
      <Header title="Not Found | Telow" />
      <Grid
        templateColumns="repeat(12, 1fr)"
        gap={5}
        style={{ backgroundColor: '#000' }}
        p="25px"
      >
        <GridItem colSpan={{ base: 12 }} width="60%" margin="auto">
          <Lottie
            style={{
              width: '100%',
              zIndex: -1,
              overflow: 'hidden',
              display: 'inline-block',
            }}
            animationData={Light404}
            loop
          />
        </GridItem>
      </Grid>
    </Box>
  );
};

export default NotFound;
