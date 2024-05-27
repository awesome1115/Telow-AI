import React from 'react';
import ReactDOM from 'react-dom';
import VerifyAccountNotice from './VerifyAccountNotice';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<VerifyAccountNotice />, div);
  ReactDOM.unmountComponentAtNode(div);
});
