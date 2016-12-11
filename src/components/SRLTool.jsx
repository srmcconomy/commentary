// @flow

import React, { Component } from 'react';

import dispatcher from '../util/dispatcher';

type State = {
  value: string,
};

export default class SRLTool extends Component {

  state: State;

  constructor() {
    super();
    this.state = {
      value: '',
    }
  }

  _onChange = (event: Event) => {
    if (event.target instanceof HTMLInputElement) {
      this.setState({ value: event.target.value });
    }
  }

  _onKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      this._onClick();
    }
  }

  _onClick = () => {
    this.setState({ value: '' });
    dispatcher.dispatch({
      type: 'load-race',
      id: this.state.value,
    });
  }


  render() {
    return (
      <div className="SRLTool">
        <div className="title">
          Enter SRL race id:
        </div>
        <input
          onChange={this._onChange}
          onKeyPress={this._onKeyPress}
          value={this.state.value}
          placeholder="ie. t4kf9"
        />
        <button onClick={this._onClick}>Load buttons</button>
      </div>
    );
  }
}
