import React from 'react';
import ReactDOM from 'react-dom';
import Notifications from './Notifications';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Notifications />, div);
  ReactDOM.unmountComponentAtNode(div);
});