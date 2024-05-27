import React from 'react';
import ReactDOM from 'react-dom';
import InstanceCard from './InstanceCard';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<InstanceCard instances={[]} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
