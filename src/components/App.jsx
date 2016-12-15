// @flow

import React, { Component } from 'react';

import store from '../util/store';
import StreamArea from './StreamArea';
import Toolbar from './Toolbar';

type State = {
  aspect: string,
}

export default class App extends Component {
  state: State;

  constructor() {
    super();
    const data = store.get();
    this.state = { aspect: data.aspect };
  }

  componentDidMount() {
    store.addChangeListener(this.onStoreChange);
  }

  componentWillUnmount() {
    store.removeChangeListener(this.onStoreChange);
  }

  onStoreChange = () => {
    const data = store.get();
    this.setState({ aspect: data.aspect });
  }

  render() {
    return (
      <div className={`App ${this.state.aspect}`}>
        <Toolbar />
        <StreamArea />
      </div>
    );
  }
}
