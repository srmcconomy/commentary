// @flow

import React, { Component } from 'react';

import store from '../util/store';

type State = {
  show: boolean,
}

export default class Overlay extends Component {

  state: State;

  constructor() {
    super();
    const data = store.get();
    this.state = { show: data.overlayOn };
  }

  componentDidMount() {
    store.addChangeListener(this.onStoreChange);
  }

  componentWillUnmount() {
    store.removeChangeListener(this.onStoreChange);
  }

  onStoreChange = () => {
    const data = store.get();
    this.setState({ show: data.overlayOn });
  }

  render() {
    if (this.state.show) {
      return <div className="Overlay" />;
    }
    return null;
  }
}
