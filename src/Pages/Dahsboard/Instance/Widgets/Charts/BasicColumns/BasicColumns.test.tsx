import React from 'react';
import ReactDOM from 'react-dom';
import BasicColumns from './BasicColumns';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<BasicColumns data={[]} title="" description="" />, div);
  ReactDOM.unmountComponentAtNode(div);
});
