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
      if (action.from === 'server') {
        if (action.type !== 'ack') {
          socket.emit('dispatch', { type: 'ack', id: action.id });
        }
      } else {
        action.id = id();
        socket.emit('dispatch', action);
      }
      next(action);
    }
  }
}
