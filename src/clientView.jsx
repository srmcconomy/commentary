import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { Map, List } from 'immutable';
import io from 'socket.io-client'

import socketMiddleware from './util/clientViewSocketMiddleware';
import reducers from './reducers';
import Stream from './data/Stream';
import Transform from './data/Transform';
import View from './components/View';

const socket = io();
const { streams: { list, positionToIndex, twitchToIndex, twitchShouldHaveSound, soundStream }, transforms, race } = window.INITIAL_STATE;
const store = createStore(
  reducers,
  {
    streams: {
      list: new List(list.map(stream => stream && new Stream(stream))),
      positionToIndex: new Map(positionToIndex),
      twitchToIndex: new Map(twitchToIndex),
      twitchShouldHaveSound: new Map(twitchShouldHaveSound),
      soundStream,
    },
    transforms: new Map(Object.keys(transforms).map(twitch => [twitch, new Transform(transforms[twitch])])),
    race,
  },
  applyMiddleware(socketMiddleware(socket)),
);
socket.emit('view');

const render = () => {
  ReactDOM.render(
    <Provider store={store}>
      <View />
    </Provider>,
    document.getElementById('react-root'),
  );
}

render();

if (module.hot) {
  module.hot.accept('./components/View', () => { render() });
}
