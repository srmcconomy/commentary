// @noflow

import { Record, Map, List } from 'immutable';

export const TransformRecord = Record({
  top: 0,
  left: 0,
  scale: 1,
  stretch: 1,
});

export const StreamRecord = Record({
  name: '',
  type: '',
  clip: '',
  position: '',
});

export class DataRecord extends Record({
  streams: List().setSize(10).map(() => null),
  transforms: new Map(),
  selectedStream: null,
  race: List(),
  overlayOn: true,
  aspect: 'a4-3',
}) {
  static fromJS(object) {
    let data = new DataRecord(object);
    if (object.hasOwnProperty('streams')) {
      const streams = object.streams.map(stream => {
        if (stream) {
          return StreamRecord(stream);
        }
        return null;
      });
      data = data.set('streams', List(streams));
    }
    if (object.hasOwnProperty('transforms')) {
      const transforms = object.transforms;
      let map = Map();
      for (let name in transforms) {
        map = map.set(name, new TransformRecord(transforms[name]));
      }
      data = data.set('transforms', map);
    }
    if (object.hasOwnProperty('race')) {
      const race = List(object.race);
      data = data.set('race', race);
    }
    return data;
  }
}
