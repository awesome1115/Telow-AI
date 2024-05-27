import React from 'react';
import ReactDOM from 'react-dom';
import SideNav from './SideNav';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<SideNav />, div);
  ReactDOM.unmountComponentAtNode(div);
});
