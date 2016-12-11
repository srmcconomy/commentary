// @flow

import { List } from 'immutable';
import express from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import socketio from 'socket.io'

import './util/SRL';
import { TransformRecord, DataRecord, StreamRecord } from './util/Records';
import App from './components/App';
import config from '../config';
import dispatcher from './util/dispatcher';
import store from './util/store';

import type { Payload } from './util/dispatcher';
import type EventEmitter from 'events';

const app = express();
const server = http.Server(app);
const io: EventEmitter = socketio(server);

server.listen(process.env.PORT || config.ports.express);

app.use('/assets', express.static(
  path.join(__dirname, 'static')
));

app.use('/images', express.static(path.join(__dirname, '../images')))

let jsFile;
if (process.env.NODE_ENV === 'production') {
  jsFile = `/assets/${config.files.client.out}/${config.files.client.outFile}`;
} else {
  jsFile = `http://localhost:${config.ports.webpack}/${config.files.client.out}/${config.files.client.outFile}`;
}

app.get('/', (req, res) => {
  const build = ReactDOMServer.renderToString(<App />);
  const html = `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="shortcut icon" href="./src/favicon.ico">
      <link rel="stylesheet" type="text/css" href="/assets/css/main.css">
      <title>Commentary Helper</title>
    </head>
    <body>
      <div id="root">${build}</div>
      <script async defer src="${jsFile}"></script>
    </body>
  </html>`
  res.send(html);
});

app.get('/save', (req, res) => {
  const data = store.get();
  fs.writeFile('./data.json', JSON.stringify(data.toJS()), function(err) {
    if(err) {
        return console.log(err);
    }
    res.send("SAVED!");
  });
});

app.get('/load', (req, res) => {
  const data = store.get();
  fs.readFile('./data.json', 'utf8', (err, data) => {
    if (err) throw err;
    store.set(DataRecord.fromJS(JSON.parse(data)));
    res.send("LOADED!");
  });
});

io.on('connection', function(socket: EventEmitter) {
  socket.emit('set', store.get());
  const token = dispatcher.register(payload => {
    socket.emit('dispatch', payload);
  });
  socket.on('dispatch', (payload) => {
    switch(payload.type) {
      case 'set-transform':
        payload.transform = new TransformRecord(payload.transform);
        break;

      case 'set-stream': case 'set-and-select-stream':
        payload.stream = new StreamRecord(payload.stream);
        break;

      case 'set-race':
        payload.entrants = List(payload.entrants);
        break;
    }
    dispatcher.broadcast(payload, token);
  });
  socket.on('disconnect', () => dispatcher.unregister(token));
});
