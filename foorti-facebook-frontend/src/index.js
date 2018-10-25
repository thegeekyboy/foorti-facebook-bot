import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import 'semantic-ui-css/semantic.min.css';
import './css/basic.css';
import './css/frame.css';

import Story from './Story';
import Poll from './Poll';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<BrowserRouter><Switch><Route path="/poll" exact component={Poll} /><Route path="/" exact component={Story} /></Switch></BrowserRouter>, document.getElementById('root'));
registerServiceWorker();
