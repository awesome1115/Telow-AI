import React, { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Box, Grid, GridItem } from '@chakra-ui/react';
import Header from '../../Shared/Header/Header';
import Profile from './Profile/Profile';
import Billing from './Billing/Billing';
import SideNav from '../../Shared/SideNav/SideNav';

interface SettingsProps {}

const Settings: FC<SettingsProps> = () => {
  return (
    <SideNav>
      <Box
        background="#fff"
        bg="white"
        m={7}
        ml={0}
        position="absolute"
        height="96%"
        overflow="hidden"
        borderRadius={20}
        p={10}
      >
        <Header title="Settings | Telow" />
        <Grid templateColumns="repeat(18, 1fr)">
          <GridItem colSpan={{ base: 18, md: 17 }} as="main">
            <Routes>
              <Route path="*" element={<Profile />} />
              <Route index path="profile" element={<Profile />} />
              <Route path="billing" element={<Billing />} />
            </Routes>
          </GridItem>
        </Grid>
      </Box>
    </SideNav>
  );
};

export default Settings;
