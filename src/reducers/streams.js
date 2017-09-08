import { Map, List } from 'immutable';

import Stream from '../data/Stream';

const STREAM_ORDER = {
  tl: 0,
  tr: 1,
  bl: 2,
  br: 3,
};

export default function (
  state = {
    list: new List([...new Array(10)].map(() => null)),
    positionToIndex: new Map(),
    twitchToIndex: new Map(),
    twitchShouldHaveSound: new Map(),
    soundStream: null
  },
  action,
) {
  let { list, positionToIndex, twitchToIndex, twitchShouldHaveSound, soundStream } = state;
  if (!list) list = new List([...new Array(10)].map(() => null));
  if (!positionToIndex) positionToIndex = new Map();
  if (!twitchToIndex) twitchToIndex = new Map();
  if (!twitchShouldHaveSound) twitchShouldHaveSound = new Map();
  switch (action.type) {
    case 'move-stream': {
      console.log(list.toJS());
      console.log(positionToIndex.toJS());
      console.log(twitchToIndex.toJS());
      const index = twitchToIndex.get(action.twitch);
      const oldPos = list.get(index).position;
      const removeIndex = positionToIndex.get(action.position);
      const removeTwitch = removeIndex != null && list.get(removeIndex).twitch;

      list = list.set(removeIndex, null).setIn([index, 'position'], action.position);
      positionToIndex = positionToIndex.set(oldPos, null).set(action.position, index);
      if (removeTwitch) twitchToIndex = twitchToIndex.delete(removeTwitch);

      if (!soundStream && oldPos === 'loading' && twitchShouldHaveSound.get(action.twitch)) {
        soundStream = action.twitch;
      } else if (soundStream === removeTwitch) {
        soundStream = list.filter(
          stream => stream && STREAM_ORDER.hasOwnProperty(stream.position) && twitchShouldHaveSound.get(stream.twitch)
        ).sort(
          (a, b) => STREAM_ORDER[a.position] - STREAM_ORDER[b.position]
        ).first();
        soundStream = soundStream && soundStream.twitch;
      }
      return { list, positionToIndex, twitchToIndex, twitchShouldHaveSound, soundStream };
    }
    case 'remove-stream': {
      const index = twitchToIndex.get(action.twitch);
      const stream = list.get(index);

      list = list.set(index, null);
      positionToIndex = positionToIndex.set(stream.position, null);
      twitchToIndex = twitchToIndex.delete(stream.twitch);

      if (soundStream === action.twitch) {
        soundStream = list.filter(
          stream => stream && STREAM_ORDER.hasOwnProperty(stream.position) && twitchShouldHaveSound.get(stream.twitch)
        ).sort(
          (a, b) => STREAM_ORDER[a.position] - STREAM_ORDER[b.position]
        ).first();
        soundStream = soundStream && soundStream.twitch;
      }
      return { list, positionToIndex, twitchToIndex, twitchShouldHaveSound, soundStream };
    }
    case 'create-stream': {
      let index = list.findIndex(stream => stream && stream.position === 'loading');
      if (index === -1) {
        index = list.findIndex(stream => !stream);
      } else {
        twitchToIndex = twitchToIndex.delete(list.get(index).twitch);
      }

      list = list.set(index, new Stream({ twitch: action.twitch, position: 'loading'}));
      positionToIndex = positionToIndex.set('loading', index);
      twitchToIndex = twitchToIndex.set(action.twitch, index);

      return { list, positionToIndex, twitchToIndex, twitchShouldHaveSound, soundStream };
    }
    case 'allow-sound-stream':
      twitchShouldHaveSound = twitchShouldHaveSound.set(action.twitch, true);

      if (!soundStream && list.has(twitchToIndex.get(action.twitch)) && list.get(twitchToIndex.get(action.twitch)).position !== 'loading') {
        soundStream = action.twitch;
      }

      return { list, positionToIndex, twitchToIndex, twitchShouldHaveSound, soundStream };
    case 'disallow-sound-stream':
      twitchShouldHaveSound = twitchShouldHaveSound.set(action.twitch, false);

      if (soundStream === action.twitch) {
        soundStream = list.filter(
          stream => stream && STREAM_ORDER.hasOwnProperty(stream.position) && twitchShouldHaveSound.get(stream.twitch)
        ).sort(
          (a, b) => STREAM_ORDER[a.position] - STREAM_ORDER[b.position]
        ).first();
        soundStream = soundStream && soundStream.twitch;
      }

      return { list, positionToIndex, twitchToIndex, twitchShouldHaveSound, soundStream };
    case 'refresh-stream': {
      const index = twitchToIndex.get(action.twitch);

      list = list.setIn([index, 'refresh'], !list.getIn([index, 'refresh']));

      return { list, positionToIndex, twitchToIndex, twitchShouldHaveSound, soundStream };
    }

    case 'stream-done-loading': {
      const index = twitchToIndex.get(action.twitch);

      list = list.setIn([index, 'loading'], false);

      return { list, positionToIndex, twitchToIndex, twitchShouldHaveSound, soundStream };
    }
    default:
      return { list, positionToIndex, twitchToIndex, twitchShouldHaveSound, soundStream };
  }
}
