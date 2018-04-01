import React from 'react';
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import rootReducer from './reducers/index'
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import App from './components/App'

const store = createStore(rootReducer);
console.log(store);
const unsubscribe = store.subscribe(() =>
    console.log(store.getState())
);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root'));

registerServiceWorker();
