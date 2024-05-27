import React from 'react';
import ReactDOM from 'react-dom';
import ChatHistory from './ChatHistory';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<ChatHistory instance={null} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
