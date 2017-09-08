export default function (state = '', action) {
  if (action.type === 'set-race') return action.race;
  return state;
}
