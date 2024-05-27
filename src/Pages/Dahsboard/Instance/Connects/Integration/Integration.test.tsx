import React from 'react';
import ReactDOM from 'react-dom';
import Integration from './Integration';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Integration name="" />, div);
  ReactDOM.unmountComponentAtNode(div);
});
