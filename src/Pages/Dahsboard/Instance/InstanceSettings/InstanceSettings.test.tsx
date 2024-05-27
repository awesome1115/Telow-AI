import React from 'react';
import ReactDOM from 'react-dom';
import InstanceSettings from './InstanceSettings';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<InstanceSettings />, div);
  ReactDOM.unmountComponentAtNode(div);
});
