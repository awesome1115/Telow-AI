import React from 'react';
import ReactDOM from 'react-dom';
import LiveSupport from './SupportChat';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<LiveSupport />, div);
  ReactDOM.unmountComponentAtNode(div);
});
