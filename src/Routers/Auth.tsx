import { createBrowserRouter } from 'react-router-dom';

import Auth from '../Pages/Auth/Auth'; // Auth

const AuthRouter = createBrowserRouter([
  {
    path: '*',
    element: <Auth />,
  },
]);

export default AuthRouter;
