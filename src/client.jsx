import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './preload-modules';

import App from './components/App';
import AsyncPrerenderProvider from './util/AsyncPrerenderProvider';
import asyncPrerender from './util/asyncPrerender';

(async function() {
  const render = async () => {
    const registry = {}
    const app = (
      <AsyncPrerenderProvider registry={registry}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AsyncPrerenderProvider>
    );
    await asyncPrerender(app);
    ReactDOM.hydrate(app, document.getElementById('react-root'));
  }

  render();

  if (module.hot) {
    module.hot.accept('./components/App', () => { render() });
  }

})()
