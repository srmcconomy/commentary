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
    store.addChangeListener(this.onStoreChange);
  }

  componentWillUnmount() {
    store.removeChangeListener(this.onStoreChange);
  }

  onClick = () => {
    const checked = !this.state.checked;
    dispatcher.dispatch({
      type: 'set-overlay',
      value: checked,
    });
  }

  onStoreChange = () => {
    const data = store.get();
    this.setState({ checked: data.overlayOn });
  }

  render() {
    return (
      <div className="OverlayTool" onClick={this.onClick}>
        <div className="title">
          Prevent interaction with streams:
        </div>
        <input type="checkbox" checked={this.state.checked} />
      </div>
    );
  }
}
