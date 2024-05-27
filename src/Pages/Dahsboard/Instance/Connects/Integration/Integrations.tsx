import { FC } from 'react';
import GoogleAnalyticsIcon from '@assets/thirdparty/google-analytics.svg';
import GAConnect from './Connections/GA';

type IntegrationProps = {
  name: string;
  svgIcon: string; // replace `any` with the actual type if possible
  AuthViewComponent?: FC;
};

const Integrations: IntegrationProps[] = [
  {
    name: 'Google Analytics',
    svgIcon: GoogleAnalyticsIcon,
    AuthViewComponent: GAConnect,
  },
];

export default Integrations;
