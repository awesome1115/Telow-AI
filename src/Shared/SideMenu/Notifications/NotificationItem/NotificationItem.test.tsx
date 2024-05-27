import React from 'react';
import ReactDOM from 'react-dom';
import NotificationItem from './NotificationItem';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<NotificationItem />, div);
  ReactDOM.unmountComponentAtNode(div);
});