import { generate as id } from 'shortid';

const resolves = {};

export default function (socket) {
  return store => {
    socket.on('dispatch', action => {
      action.from = 'server';
      store.dispatch(action);
    });
    return next => async action => {
      console.log(action);
      console.log(resolves);
      if (action.from === 'server') {
        if (resolves.hasOwnProperty(action.id)) {
          resolves[action.id](action);
          delete resolves[action.id];
        }
        next(action);
      } else {
        action.id = id();
        action.from = 'client';
        socket.emit('dispatch', action);
        await new Promise(res => {
          resolves[action.id] = res;
        });
        next(action);
      }
    }
  }
}
