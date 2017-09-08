import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames/bind';

import Stream from './Stream';

import styles from './streamArea.scss';

const cx = classnames.bind(styles);

const NUM_BACKGROUNDS = 35;

const BACKGROUND_TIME = 60000;

function randomBackground() {
  return (Math.random() * NUM_BACKGROUNDS | 0) + 1;
}

class StreamArea extends Component {
  constructor() {
    super();
    this.state = { background0: randomBackground(), background1: randomBackground(), currentBackground: 0 };
  }

  otherBackground = () => (this.state.currentBackground - 1) * -1;

  componentDidMount() {
    this.timeout = setTimeout(this.switchBackgrounds, BACKGROUND_TIME);
  }

  switchBackgrounds = () => {
    this.setState({ currentBackground: this.otherBackground() });
    this.timeout = setTimeout(this.loadBackground, BACKGROUND_TIME / 2);
  }

  loadBackground = () => {
    this.setState({ [`background${this.otherBackground()}`]: randomBackground() });
    this.timeout = setTimeout(this.switchBackgrounds, BACKGROUND_TIME / 2);
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  render() {
    return (
      <div className={styles.streamArea}>
        <div className={cx({ background: true, current: this.state.currentBackground === 0 })} style={{ backgroundImage: `url(/assets/${this.state.background0}.png)` }} />
        <div className={cx({ background: true, current: this.state.currentBackground === 1 })} style={{ backgroundImage: `url(/assets/${this.state.background1}.png)` }} />
        {this.props.streams.map((_, index) => <Stream index={index} key={index} view={this.props.view} />)}
      </div>
    );
  }
}

export default connect(
  state => ({ streams: state.streams.list })
)(StreamArea);
