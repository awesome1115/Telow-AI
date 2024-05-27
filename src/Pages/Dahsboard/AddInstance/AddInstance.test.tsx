import React from 'react';
import ReactDOM from 'react-dom';
import AddInstance from './AddInstance';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<AddInstance />, div);
  ReactDOM.unmountComponentAtNode(div);
});