export function setTransform(twitch, transform) {
  return {
    type: 'set-transform',
    twitch,
    transform,
  };
}
