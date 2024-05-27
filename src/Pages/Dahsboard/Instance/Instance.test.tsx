import React from 'react';
import ReactDOM from 'react-dom';
import Instance from './Instance';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Instance />, div);
  ReactDOM.unmountComponentAtNode(div);
});
