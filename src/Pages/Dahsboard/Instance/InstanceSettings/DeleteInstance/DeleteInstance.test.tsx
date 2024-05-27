import React from 'react';
import ReactDOM from 'react-dom';
import DeleteInstance from './DeleteInstance';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<DeleteInstance />, div);
  ReactDOM.unmountComponentAtNode(div);
});