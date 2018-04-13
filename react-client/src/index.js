import React from 'react';
import ReactDOM from 'react-dom'
import registerServiceWorker from './registerServiceWorker';
import App from './components/App'
import './index.css';
import 'draft-js/dist/Draft.css';

ReactDOM.render(
    <App />,
    document.getElementById('root')
);

registerServiceWorker();
