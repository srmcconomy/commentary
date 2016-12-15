// @flow

import React, { Component } from 'react';

import dispatcher from '../util/dispatcher';
import store from '../util/store';

type State = {
  selectedStream: ?string,
};

const buttonAreas = [
  [
    'f f1-1',
    'f f2-1',
    'f f1-2',
    'f f2-2',
  ], [
    'tv tv-1',
    'tv tv-2',
  ], [
    'th th-1',
    'th th-2',
  ], [
    'o',
  ],
];

export default class MoveTool extends Component {
  state: State;

  constructor() {
    super();
    const data = store.get();
    this.state = { selectedStream: data.selectedStream };
  }

  componentDidMount() {
    store.addChangeListener(this.onStoreChange);
  }

  componentWillUnmount() {
    store.removeChangeListener(this.onStoreChange);
  }

  onClick(position: string) {
    return () => {
      const { selectedStream } = this.state;
      if (selectedStream) {
        const data = store.get();
        const stream = data.streams.find(s => s && s.name === selectedStream);
        if (stream && stream.position === position) {
          dispatcher.dispatch({
            type: 'remove-stream',
            name: selectedStream,
          });
        } else {
          dispatcher.dispatch({
            type: 'move-stream',
            name: selectedStream,
            position,
          });
        }
      } else {
        dispatcher.dispatch({
          type: 'select-stream',
          position
        });
      }
    };
  }


  onStoreChange = () => {
    const data = store.get();
    this.setState({ selectedStream: data.selectedStream });
  }

  render() {
    const text = this.state.selectedStream ?
      `Move or remove ${this.state.selectedStream}'s stream` :
      'Select a stream';

    const data = store.get();
    let stream = null;
    if (this.state.selectedStream) {
      stream = data.streams.find(
        s => s && s.name === this.state.selectedStream
      );
    }

    const areas = buttonAreas.map((a, i) => {
      const buttons = a.map((c) => {
        let symbol = null;
        if (this.state.selectedStream) {
          symbol = '\u2794';
          if (stream && c === stream.position) {
            symbol = '\u2715';
          }
        }
        return (
          <button key={c} className={c} onClick={this.onClick(c)}>
            {symbol}
          </button>
        );
      });
      return (
        <div key={i} className="button-area">
          {buttons}
        </div>
      );
    });
    return (
      <div className="MoveTool">
        <div className="title">
          {text}
        </div>
        <div className="areas">
          {areas}
        </div>
      </div>
    );
  }
}
