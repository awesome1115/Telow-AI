import React from 'react';
import ReactDOM from 'react-dom';
import MenuItemNotification from './MenuItemNotification';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<MenuItemNotification />, div);
  ReactDOM.unmountComponentAtNode(div);
});