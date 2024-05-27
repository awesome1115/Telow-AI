import React from 'react';
import ReactDOM from 'react-dom';
import Profile from './Profile';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Profile />, div);
  ReactDOM.unmountComponentAtNode(div);
});
