import React from 'react';
import ReactDOM from 'react-dom';
import Chat from './Chat';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Chat instance={undefined} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
