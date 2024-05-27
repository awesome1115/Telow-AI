import React, { FC } from 'react';
import './Header.scss';
import { useAuthorizer } from '@authorizerdev/authorizer-react';
import VerifyAccountNotice from './VerifyAccountNotice/VerifyAccountNotice';

interface HeaderProps {
  title: string;
}

const Header: FC<HeaderProps> = ({ title }) => {
  document.title = title;

  const { user } = useAuthorizer();
  return <div>{user?.email_verified ? null : <VerifyAccountNotice />}</div>;
};

export default Header;
