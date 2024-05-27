import React from 'react';
import ReactDOM from 'react-dom';
import HistoryChart from './HistoryChart';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<HistoryChart />, div);
  ReactDOM.unmountComponentAtNode(div);
});
