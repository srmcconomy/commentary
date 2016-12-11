// @noflow

import { Dispatcher } from 'flux';

class ExceptDispatcher<TPayload> extends Dispatcher<TPayload> {
  broadcast(payload: TPayload, except: string): void {
    // invariant(
    //   !this._isDispatching,
    //   'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.'
    // );
    this._startDispatching(payload);
    try {
      for (var id in this._callbacks) {
        if (id === except) continue;
        if (this._isPending[id]) {
          continue;
        }
        this._invokeCallback(id);
      }
    } finally {
      this._stopDispatching();
    }
  }
}

export default new ExceptDispatcher();
