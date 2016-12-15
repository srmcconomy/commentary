// @noflow

import { Record, Map, List } from 'immutable';

export class TransformRecord extends new Record({
  top: 0,
  left: 0,
  scale: 1,
  stretch: 1,
}) { }

export class StreamRecord extends new Record({
  name: '',
  type: '',
  clip: '',
  position: '',
}) { }

export class DataRecord extends new Record({
  streams: new List().setSize(10).map(() => null),
  transforms: new Map(),
  selectedStream: null,
  race: new List(),
  overlayOn: true,
  aspect: 'a4-3',
}) {
  static fromJS(object) {
    let data = new DataRecord(object);
    if (Object.hasOwnProperty.bind(object, 'streams')) {
      const streams = object.streams.map((stream) => {
        if (stream) {
          return new StreamRecord(stream);
        }
        return null;
      });
      data = data.set('streams', new List(streams));
    }
    if (Object.hasOwnProperty.bind(object, 'transforms')) {
      const transforms = object.transforms;
      let map = new Map();
      for (let name in transforms) {
        map = map.set(name, new TransformRecord(transforms[name]));
      }
      data = data.set('transforms', map);
    }
    if (Object.hasOwnProperty.bind(object, 'race')) {
      const race = new List(object.race);
      data = data.set('race', race);
    }
    return data;
  }
}
