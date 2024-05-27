import React from 'react';
import ReactDOM from 'react-dom';
import Widgets from './Widgets';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Widgets />, div);
  ReactDOM.unmountComponentAtNode(div);
});
