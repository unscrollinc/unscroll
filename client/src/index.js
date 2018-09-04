import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import App from './components/App';
import { BrowserRouter } from 'react-router-dom';
import './css/rangeslider.css';
import 'react-quill/dist/quill.snow.css';
import './css/index.css';

import 'draft-js/dist/Draft.css';

ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById('root')
);

registerServiceWorker();
