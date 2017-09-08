export function moveStream(twitch, position) {
  return {
    type: 'move-stream',
    twitch,
    position,
  };
}

export function removeStream(twitch) {
  return {
    type: 'remove-stream',
    twitch,
  };
}

export function createStream(twitch) {
  return {
    type: 'create-stream',
    twitch,
  };
}

export function refreshStream(twitch) {
  return {
    type: 'refresh-stream',
    twitch,
  };
}

export function allowSoundStream(twitch) {
  return {
    type: 'allow-sound-stream',
    twitch,
  };
}

export function disallowSoundStream(twitch) {
  return {
    type: 'disallow-sound-stream',
    twitch,
  };
}

export function streamDoneLoading(twitch) {
  return {
    type: 'stream-done-loading',
    twitch,
  };
}
