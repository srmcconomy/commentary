// @flow

import EventEmitter from 'events';
import { DataRecord, TransformRecord } from './Records';
import dispatcher from './dispatcher';
import type { DispatchToken } from './dispatcher';


class Store extends EventEmitter {
  _data: DataRecord;
  _dispatchToken: DispatchToken;

  constructor() {
    super();
    this._data = new DataRecord();

    this._dispatchToken = dispatcher.register(payload => {
      const oldData = this._data;

      switch(payload.type) {
        case 'set-transform':
          this._data = this._data.setIn(
            ['transforms', payload.name],
            payload.transform
          );
          break;

        case 'set-stream': {
          let toIndex = this._data.streams.findIndex(
            stream => stream && stream.position === 'loading'
          );
          if (toIndex === -1) {
            toIndex = this._data.streams.findIndex(
              stream => stream === null
            );
          }
          this._data = this._data.setIn(
            ['streams', toIndex],
            payload.stream
          );
          if (!this._data.transforms.has(payload.stream.name)) {
            this._data = this._data.setIn(
              ['transforms', payload.stream.name],
              new TransformRecord()
            );
          }
          break;
        }

        case 'move-stream': {
          const { name, position } = payload;
          const fromIndex = this._data.streams.findIndex(
            value => value && value.name === name
          );
          let toIndex = this._data.streams.findIndex(
            value => value && value.position === position
          );
          if (toIndex > -1) {
            this._data = this._data.setIn(
              ['streams', toIndex],
              null
            );
          }
          if (fromIndex > -1) {
            this._data = this._data.setIn(
              ['streams', fromIndex, 'position'],
              position
            );
          }
          this._data = this._data.set('selectedStream', null);
          break;
        }

        case 'remove-stream':
          const { name } = payload;
          const index = this._data.streams.findIndex(s => s && s.name === name);
          if (index > -1) {
            this._data = this._data.setIn(
              ['streams', index],
              null
            );
          }
          break;

        case 'select-stream':
          const { position } = payload;
          const stream = this._data.streams.find(s => s && s.position === position);
          if (stream) {
            this._data = this._data.set('selectedStream', stream.name);
          }
          break;

        case 'set-and-select-stream': {
          let toIndex = this._data.streams.findIndex(
            stream => stream && stream.position === 'loading'
          );
          if (toIndex === -1) {
            toIndex = this._data.streams.findIndex(
              stream => stream === null
            );
          }
          this._data = this._data.setIn(
            ['streams', toIndex],
            payload.stream
          ).set('selectedStream', payload.name);
          if (!this._data.transforms.has(payload.stream.name)) {
            this._data = this._data.setIn(
              ['transforms', payload.stream.name],
              new TransformRecord()
            );
          }
          break;
        }

        case 'set-overlay':
          this._data = this._data.set('overlayOn', payload.value);
          break;

        case 'set-race':
          this._data = this._data.set('race', payload.entrants);
          break;

        case 'set-aspect':
          this._data = this._data.set('aspect', payload.aspect);
          break;

        default: break;
      }
      if (oldData !== this._data) {
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
    return this._data;
  }

  set = (newData: DataRecord) => {
    if (newData !== this._data) {
      this._data = newData;
      this.emitChange();
    }
  }
}

export default new Store();
