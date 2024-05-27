import { Box, Text } from '@chakra-ui/react';
import React, { FC } from 'react';

interface VerifyAccountNoticeProps {}

const VerifyAccountNotice: FC<VerifyAccountNoticeProps> = () => (
  <Box
    p={3}
    px={10}
    alignItems="center"
    width="100%"
    textAlign="center"
    background="#ffd8d8"
  >
    <Text fontWeight={600}>
      You need to verify your account by clicking the link in the email we sent.
    </Text>
  </Box>
);

export default VerifyAccountNotice;
