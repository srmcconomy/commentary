import 'source-map-support/register';
import express from 'express';
import path from 'path';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { Map } from 'immutable';
import http from 'http';
import socketio from 'socket.io';

import mongodb from 'mongodb';

import Transform from './data/Transform';
import config from '../config';
import reducers from './reducers';
import socketMiddleware from './util/serverSocketMiddleware';
import ListenerMiddleware from './util/listenerMiddleware';

(async function init() {

  let initState = {
    streams: { twitchShouldHaveSound: new Map() },
    transforms: new Map(),
  };

  const app = express();
  const server = http.Server(app);
  const io = socketio(server);
  const listenerMiddleware = new ListenerMiddleware();

  const db = await mongodb.MongoClient.connect('mongodb://localhost:27017/commentary');
  const collection = db.collection('streams');

  const docs = await collection.find().toArray();

  docs.forEach(doc => {
    if (!doc.name) return;
    if (doc.transform) {
      initState.transforms = initState.transforms.set(doc.name, new Transform(doc.transform));
    }
    if (doc.allowSound) {
      initState.streams.twitchShouldHaveSound = initState.streams.twitchShouldHaveSound.set(doc.name, doc.allowSound);
    }
  });

  await collection.createIndex({ name: 1 }, { unique: true });
  listenerMiddleware.addListener(async action => {
    switch (action.type) {
      case 'set-transform':
        await collection.updateOne(
          { name: action.twitch },
          { $set: { transform: action.transform.toJS() } },
          { upsert: true },
        );
        break;
      case 'allow-sound-stream':
        await collection.updateOne(
          { name: action.twitch },
          { $set: { allowSound: true } },
          { upsert: true },
        );
        break;
      case 'disallow-sound-stream':
        await collection.updateOne(
          { name: action.twitch },
          { $set: { allowSound: false } },
          { upsert: true },
        );
        break;
    }
  });

  console.log(initState.streams.twitchShouldHaveSound.toJS());

  const store = createStore(reducers, initState, applyMiddleware(socketMiddleware(io), listenerMiddleware.middleware));

  app.use('/assets', express.static(
    path.join(__dirname, '../assets')
  ));

  const sourcePath = process.env.NODE_ENV === 'production' ? '/dist/' : 'http://localhost:9000/assets/';

  app.get('/edit', (req, res) => {
    const { streams: { list, positionToIndex, twitchToIndex, twitchShouldHaveSound, soundStream }, transforms, race } = store.getState();
    const initialState = {
      streams: {
        list: list.toJS(),
        positionToIndex: positionToIndex.toJS(),
        twitchToIndex: twitchToIndex.toJS(),
        twitchShouldHaveSound: twitchShouldHaveSound.toJS(),
        soundStream,
      },
      transforms: transforms.toJS(),
      race,
    };
    res.send(
  `<html>
    <head>
      <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
      <script src= "http://player.twitch.tv/js/embed/v1.js"></script>
    </head>
    <body>
      <div id="react-root"></div>
      <script>window.INITIAL_STATE = ${JSON.stringify(initialState)}</script>
      <script src="${sourcePath}edit.js"></script>
    </body>
  </html>`
    );
  });

  app.get('/', (req, res) => {
    const { streams: { list, positionToIndex, twitchToIndex, twitchShouldHaveSound, soundStream }, transforms, race } = store.getState();
    const initialState = {
      streams: {
        list: list.toJS(),
        positionToIndex: positionToIndex.toJS(),
        twitchToIndex: twitchToIndex.toJS(),
        twitchShouldHaveSound: twitchShouldHaveSound.toJS(),
        soundStream,
      },
      transforms: transforms.toJS(),
      race,
    };
    res.send(
  `<html>
    <head>
      <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
      <script src= "http://player.twitch.tv/js/embed/v1.js"></script>
    </head>
    <body>
      <div id="react-root"></div>
      <script>window.INITIAL_STATE = ${JSON.stringify(initialState)}</script>
      <script src="${sourcePath}/view.js"></script>
    </body>
  </html>`
    );
  });

  server.listen(process.env.PORT || config.port);
})()


