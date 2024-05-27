import React from 'react';
import ReactDOM from 'react-dom';
import Connects from './Connects';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Connects />, div);
  ReactDOM.unmountComponentAtNode(div);
});
