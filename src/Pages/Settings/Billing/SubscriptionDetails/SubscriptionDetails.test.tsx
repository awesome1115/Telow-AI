import React from 'react';
import ReactDOM from 'react-dom';
import SubscriptionDetails from './SubscriptionDetails';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<SubscriptionDetails />, div);
  ReactDOM.unmountComponentAtNode(div);
});