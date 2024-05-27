import React from 'react';
import ReactDOM from 'react-dom';
import CheckoutForm from './CheckoutForm';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<CheckoutForm />, div);
  ReactDOM.unmountComponentAtNode(div);
});
