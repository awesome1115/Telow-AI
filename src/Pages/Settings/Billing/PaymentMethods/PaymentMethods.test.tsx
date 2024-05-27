import React from 'react';
import ReactDOM from 'react-dom';
import PaymentMethods from './PaymentMethods';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<PaymentMethods />, div);
  ReactDOM.unmountComponentAtNode(div);
});
