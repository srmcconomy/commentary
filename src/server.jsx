import express from 'express';
import path from 'path';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import config from '../config';
import { StaticRouter } from 'react-router-dom';
import App from './components/App'
import { get } from '../addImport';
import asyncPrerender from './util/asyncPrerender';
import AsyncPrerenderProvider from './util/AsyncPrerenderProvider';
// import asyncBootstrapper from 'react-async-bootstrapper'

const app = express();

// app.use('/assets', express.static(
//   path.join(__dirname, '../dist')
// ));

app.use(async (req, res) => {
  const context = {};
  const registry = {};
  const app = (
    <AsyncPrerenderProvider registry={registry}>
      <StaticRouter location={req.url} context={context}>
        <App />
      </StaticRouter>
    </AsyncPrerenderProvider>
  );
  await asyncPrerender(app);
  const html = ReactDOMServer.renderToString(app);
  res.send(
`<html>
  <body>
    <div id="react-root">${html}</div>
    <script src="http://localhost:9000/assets/app.js"></script>
  </body>
</html>`
  );
});

app.listen(process.env.PORT || config.port);
