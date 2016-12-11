// @flow

import React, { Component } from 'react';

import { TransformRecord, StreamRecord } from '../util/Records';
import dispatcher from '../util/dispatcher';
import store from '../util/store';

type Props = {
  index: number,
  aspect: string,
}

type State = {
  stream: ?StreamRecord,
  transform: ?TransformRecord,
  lifeState: 'fading' | 'appearing' | 'alive',
}

export default class Stream extends Component {

  props: Props;

  state: State;

  constructor(props: Props) {
    super(props);
    const data = store.get();
    const stream = data.streams.get(props.index);
    if (stream) {
      if (data.transforms.has(stream.name)) {
        this.state = {
          transform: data.transforms.get(stream.name),
          stream,
          lifeState: 'alive',
        };
      } else {
        this.state = {
          transform: new TransformRecord(),
          stream,
          lifeState: 'alive',
        };
      }
    } else {
      this.state = {
        stream: null,
        transform: null,
        lifeState: 'alive',
      }
    }
  }

  _onTransitionEnd = () => {
    if (this.state.lifeState === 'fading') {
      this.setState({ lifeState: 'alive', stream: null, transform: null })
    }
  }

  componentDidMount() {
    store.addChangeListener(this._onStoreChange);
  }

  componentWillUnmount() {
    store.removeChangeListener(this._onStoreChange);
  }

  _onStoreChange = (): void => {
    const data = store.get();
    const stream = data.streams.get(this.props.index);
    if (this.state.stream && !stream) {
      this.setState({ lifeState: 'fading' });
      return;
    }
    if (!stream) {
      this.setState({ stream, transform: null });
      return;
    }
    let lifeState = this.state.lifeState;
    let transform = this.state.transform;
    if (stream && stream.name && data.transforms.has(stream.name)) {
      transform = data.transforms.get(stream.name);
    }

    if (!transform) {
      transform = new TransformRecord();
    }

    if (this.state.lifeState === 'alive' &&
      this.state.stream &&
      this.state.stream.position === 'loading' &&
      stream.position !== 'loading'
    ) {
      lifeState = 'appearing';
      setTimeout(() => {
        this.setState({ lifeState: 'alive' });
      }, 500)
    } else {
      lifeState = 'alive';
    }
    this.setState({ stream, transform, lifeState });
  }

  render() {
    const { aspect } = this.props;
    const { stream, transform, lifeState } = this.state;
    if (stream && transform) {
      const { name, position, type, clip } = stream;
      const { left, top, scale, stretch } = transform;
      const width = 133.333 * scale;
      const height = 140 * scale;
      let url;
      if (type === 'stream') {
        url = `http://player.twitch.tv/?muted=true&channel=${name}`;
      } else if (clip) {
        url = `https://clips.twitch.tv/embed?clip=${name}/${clip}&autoplay=0`;
      }
      let header = null;
      if (type === 'clip') {
        header = <div className="header">Instant Replay</div>;
      }
      return (
        <div
          className={`Stream ${position} ${lifeState}`}
          onTransitionEnd={this._onTransitionEnd}>
          {header}
          <div className="name">{name}</div>
          <iframe
            src={url}
            style={{
              left: `${left}%`,
              top: `${-20 + top}%`,
              height: `${height}%`,
              width: `${width}%`,
              transform: `scaleX(${stretch})`,
            }}
          />
        </div>
      );
    } else {
      return null;
    }
  }
}
