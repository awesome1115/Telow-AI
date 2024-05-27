import React from 'react';
import ReactDOM from 'react-dom';
import Dahsboard from './Dahsboard';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Dahsboard />, div);
  ReactDOM.unmountComponentAtNode(div);
});
