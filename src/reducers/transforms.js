import { Map } from 'immutable';

import Transform from '../data/Transform';

export default function (state = new Map(), action) {
  switch (action.type) {
    case 'create-stream':
      if (!state.has(action.twitch)) {
        return state.set(action.twitch, new Transform());
      }
      return state;
    case 'set-transform':
      if (!action.transform.set) {
        action.transform = new Transform(action.transform);
      }
      return state.set(action.twitch, action.transform);
    default:
      return state;
  }
}
