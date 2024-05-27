import React from 'react';
import ReactDOM from 'react-dom';
import Billing from './Billing';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Billing />, div);
  ReactDOM.unmountComponentAtNode(div);
});
