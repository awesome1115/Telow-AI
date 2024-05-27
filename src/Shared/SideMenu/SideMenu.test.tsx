import React from 'react';
import ReactDOM from 'react-dom';
import Sidebar from './SideMenu';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Sidebar divider={false} menuItems={[]} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
