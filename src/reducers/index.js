import streams from './streams';
import transforms from './transforms';
import srl from './srl';

export default function (state, action) {
  return {
    streams: streams(state && state.streams, action),
    transforms: transforms(state && state.transforms, action),
    race: srl(state && state.race, action),
  };
}
