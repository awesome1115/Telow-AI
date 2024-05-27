import React from 'react';
import ReactDOM from 'react-dom';
import AccountBalance from './AccountBalance';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<AccountBalance />, div);
  ReactDOM.unmountComponentAtNode(div);
});
