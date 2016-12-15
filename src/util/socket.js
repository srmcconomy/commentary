// @flow

import { List } from 'immutable';
import io from 'socket.io-client';
import type EventEmitter from 'events';

import { DataRecord, TransformRecord, StreamRecord } from './Records';
import dispatcher from './dispatcher';
import store from './store';

const socket: EventEmitter = io();
const token = dispatcher.register((payload) => {
  socket.emit('dispatch', payload);
});
socket.on('dispatch', (payload) => {
  switch (payload.type) {
    case 'set-transform':
      payload.transform = new TransformRecord(payload.transform);
      break;

    case 'set-stream': case 'set-and-select-stream':
      payload.stream = new StreamRecord(payload.stream);
      break;

    case 'set-race':
      payload.entrants = new List(payload.entrants);
      break;

    default:
  }
  dispatcher.broadcast(payload, token);
});
socket.on('set', (data) => {
  store.set(DataRecord.fromJS(data));
});
