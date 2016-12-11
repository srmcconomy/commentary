// @flow

import io from 'socket.io-client';

import dispatcher from './dispatcher';
import type EventEmitter from 'events';
import store from './store';
import { List } from 'immutable';
import { DataRecord, TransformRecord, StreamRecord } from './Records';

const socket: EventEmitter = io();
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
socket.on('set', data => {
  store.set(DataRecord.fromJS(data));
});
