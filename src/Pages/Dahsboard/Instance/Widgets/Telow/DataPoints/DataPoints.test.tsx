import React from 'react';
import ReactDOM from 'react-dom';
import DataPoints from './DataPoints';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<DataPoints instance={undefined} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
