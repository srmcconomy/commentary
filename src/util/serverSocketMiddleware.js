import { generate as id } from 'shortid';

const resolves = {};
let viewSocket = null;

export default function (io) {
  return store => {
    io.on('connection', socket => {
      socket.on('dispatch', async action => {
        console.log(action);
        action.from = socket;
        store.dispatch(action);
        if (action.type === 'create-stream' && !viewSocket) {
          socket.broadcast.emit('dispatch', { type: 'stream-done-loading', twitch: action.twitch });
          socket.emit('dispatch', { type: 'stream-done-loading', twitch: action.twitch });
        }
      });
      socket.on('view', () => {
        viewSocket = socket;
      });
      socket.on('disconnect', () => {
        if (viewSocket && viewSocket.id === socket.id) viewSocket = null;
      });
    });
    return next => async action => {
      if (action.type === 'ack') {
        if (resolves.hasOwnProperty(action.id)) {
          resolves[action.id](action);
          delete resolves[action.id];
        }
      } else {
        const socket = action.from;
        action.from = 'server';
        socket.broadcast.emit('dispatch', action);
        next(action);
        if (viewSocket) {
          await new Promise(res => {
            resolves[action.id] = res;
          });
        }
        socket.emit('dispatch', { id: action.id, type: 'ack' });
      }
    };
  }
}
