export default class Middleware {
  listeners = {};
  middleware = store => next => action => {
    next(action);
    Object.values(this.listeners).forEach(listener => listener(action));
  }

  addListener(listener) {
    this.listeners[listener] = listener;
    return () => delete this.listeners[listener];
  }
}
