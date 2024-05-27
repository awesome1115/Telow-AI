import { createBrowserRouter } from 'react-router-dom';
import Dahsboard from '../Pages/Dahsboard/Dahsboard';
import Instance from '../Pages/Dahsboard/Instance/Instance';
import InstanceSettings from '../Pages/Dahsboard/Instance/InstanceSettings/InstanceSettings';
import Settings from '../Pages/Settings/Settings';
import Profile from '../Pages/Settings/Profile/Profile';
import Billing from '../Pages/Settings/Billing/Billing';
import NotFound from '../Pages/NotFound/NotFound';
import Chat from '../Pages/Dahsboard/Instance/Chat/Chat';

const MainRouter = createBrowserRouter([
  {
    path: '/*',
    element: <Dahsboard />,
    errorElement: <NotFound />,
    children: [
      {
        path: 'instance/:id/*',
        errorElement: <NotFound />,
        element: <Instance />,
        children: [
          {
            path: 'settings',
            element: <InstanceSettings />,
          },
          {
            path: 'chat/*',
            element: <Chat instance={undefined} />,
            errorElement: <NotFound />,
          },
        ],
      },
    ],
  },
  {
    path: 'settings/*',
    element: <Settings />,
    errorElement: <NotFound />,
    children: [
      { path: 'profile', element: <Profile />, errorElement: <NotFound /> },
      { path: 'billing', element: <Billing />, errorElement: <NotFound /> },
    ],
  },
]);

export default MainRouter;
