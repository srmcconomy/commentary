// @flow

import express from 'express';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import config from '../config';
import App from './components/App';

global.navigator = { navigator: 'all' };

const app = express();
app.use('/assets/', express.static(path.join(__dirname, '../build/static')));

let jsFile;
if (process.env.NODE_ENV === 'production') {
  jsFile = `/assets/${config.files.client.out}/${config.files.client.outFile}`;
} else {
  jsFile = `http://localhost:${config.ports.webpack}/${config.files.client.out}/${config.files.client.outFile}`;
}

app.use((req, res) => {
  const content = ReactDOMServer.renderToString(<App />);
  res.send(
    `<html>
      <head>
        <link rel="stylesheet" href="/assets/css/main.css" />
      </head>
      <body>
        <div id="react-root">${content}</div>
        <script async defer src="${jsFile}"></script>
      </body>
    </html>`
  );
});

app.listen(config.ports.express, () => {
  console.log(`Listening on port ${config.ports.express}`);
});
