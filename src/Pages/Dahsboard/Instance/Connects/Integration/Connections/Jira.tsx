import React, { FC, useEffect, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Box, Button, Flex, Image, Select, useToast } from '@chakra-ui/react';
import { useAuthorizer } from '@authorizerdev/authorizer-react';
// eslint-disable-next-line import/no-extraneous-dependencies
import axios, { AxiosResponse } from 'axios';
import JiraIcon from '@assets/thirdparty/jira.svg';
import useActiveInstanceStore from '../../../../../../States/instancesStore';

const JiraConnect: FC = () => {
  const activeInstance = useActiveInstanceStore((state) => state.instance);
  const toast = useToast();
  const { user } = useAuthorizer();

  return <Box display="flex" />;
};

export default JiraConnect;
