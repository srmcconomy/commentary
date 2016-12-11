// @flow

import React, { Component } from 'react';

import dispatcher from '../util/dispatcher';
import store from '../util/store';

type State = {
  checked: boolean,
}

export default class OverlayTool extends Component {

  state: State;

  constructor() {
    super();
    const data = store.get();
    this.state = { checked: data.overlayOn };
  }

  componentDidMount() {
    store.addChangeListener(this._onStoreChange);
  }

  componentWillUnmount() {
    store.removeChangeListener(this._onStoreChange);
  }

  _onClick = (event: Event) => {
    const checked = !this.state.checked;
    dispatcher.dispatch({
      type: 'set-overlay',
      value: checked,
    });
  }

  _onStoreChange = () => {
    const data = store.get();
    this.setState({ checked: data.overlayOn });
  }

  render() {
    return (
      <div className="OverlayTool" onClick={this._onClick}>
        <div className="title">
          Prevent interaction with streams:
        </div>
        <input type="checkbox" checked={this.state.checked} />
      </div>
    );
  }
}
