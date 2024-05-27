import React from 'react';
import ReactDOM from 'react-dom';
import Markdown from './Markdown';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Markdown markdownText="" />, div);
  ReactDOM.unmountComponentAtNode(div);
});
