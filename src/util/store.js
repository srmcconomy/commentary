// @flow

import EventEmitter from 'events';

import { DataRecord, TransformRecord } from './Records';
import dispatcher from './dispatcher';
import type { DispatchToken } from './dispatcher';


class Store extends EventEmitter {
  data: DataRecord;
  dispatchToken: DispatchToken;

  constructor() {
    super();
    this.data = new DataRecord();

    this.dispatchToken = dispatcher.register((payload) => {
      const oldData = this.data;

      switch (payload.type) {
        case 'set-transform':
          this.data = this.data.setIn(
            ['transforms', payload.name],
            payload.transform
          );
          break;

        case 'set-stream': {
          let toIndex = this.data.streams.findIndex(
            stream => stream && stream.position === 'loading'
          );
          if (toIndex === -1) {
            toIndex = this.data.streams.findIndex(
              stream => stream === null
            );
          }
          this.data = this.data.setIn(
            ['streams', toIndex],
            payload.stream
          );
          if (!this.data.transforms.has(payload.stream.name)) {
            this.data = this.data.setIn(
              ['transforms', payload.stream.name],
              new TransformRecord()
            );
          }
          break;
        }

        case 'move-stream': {
          const { name, position } = payload;
          const fromIndex = this.data.streams.findIndex(
            value => value && value.name === name
          );
          const toIndex = this.data.streams.findIndex(
            value => value && value.position === position
          );
          if (toIndex > -1) {
            this.data = this.data.setIn(
              ['streams', toIndex],
              null
            );
          }
          if (fromIndex > -1) {
            this.data = this.data.setIn(
              ['streams', fromIndex, 'position'],
              position
            );
          }
          this.data = this.data.set('selectedStream', null);
          break;
        }

        case 'remove-stream': {
          const { name } = payload;
          const index = this.data.streams.findIndex(s => s && s.name === name);
          if (index > -1) {
            this.data = this.data.setIn(
              ['streams', index],
              null
            );
          }
          break;
        }

        case 'select-stream': {
          const { position } = payload;
          const stream = this.data.streams.find(s => s && s.position === position);
          if (stream) {
            this.data = this.data.set('selectedStream', stream.name);
          }
          break;
        }

        case 'set-and-select-stream': {
          let toIndex = this.data.streams.findIndex(
            stream => stream && stream.position === 'loading'
          );
          if (toIndex === -1) {
            toIndex = this.data.streams.findIndex(
              stream => stream === null
            );
          }
          this.data = this.data.setIn(
            ['streams', toIndex],
            payload.stream
          ).set('selectedStream', payload.name);
          if (!this.data.transforms.has(payload.stream.name)) {
            this.data = this.data.setIn(
              ['transforms', payload.stream.name],
              new TransformRecord()
            );
          }
          break;
        }

        case 'set-overlay':
          this.data = this.data.set('overlayOn', payload.value);
          break;

        case 'set-race':
          this.data = this.data.set('race', payload.entrants);
          break;

        case 'set-aspect':
          this.data = this.data.set('aspect', payload.aspect);
          break;

        default: break;
      }
      if (oldData !== this.data) {
        this.emitChange();
      }
    });
  }

  emitChange() {
    this.emit('change');
  }

  addChangeListener(callback: () => void) {
    this.on('change', callback);
  }

  removeChangeListener(callback: () => void) {
    this.removeListener('change', callback);
  }

  get() {
    return this.data;
  }

  set = (newData: DataRecord) => {
    if (newData !== this.data) {
      this.data = newData;
      this.emitChange();
    }
  }
}

export default new Store();
