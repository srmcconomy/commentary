// @flow

import { List } from 'immutable';
import React, { Component } from 'react';

import Overlay from './Overlay';
import Stream from './Stream';

const images = [
  'deku.jpg',
  'dc.jpg',
  'jabu.png',
  'forest.png',
  'fire.png',
  'water.png',
  'shadow.png',
  'spirit.png',
];

const IMAGEDURATION = 60000;

export default class StreamArea extends Component {

  state: { imageIndex: number };
  timeout: number;

  constructor() {
    super();
    this.state = { imageIndex: 0 };
  }

  componentDidMount() {
    this.timeout = setInterval(() => {
      const imageIndex = this.state.imageIndex === images.length - 1 ?
        0 : this.state.imageIndex + 1;
      this.setState({ imageIndex });
    }, IMAGEDURATION);
  }

  render() {
    const { imageIndex } = this.state;
    const streams = (new List()).setSize(10).map((_, index) => (
      <Stream
        key={index}
        index={index}
        aspect={'a4-3'}
      />
    ));
    const imageElements = images.map((image, index) => {
      if (index === imageIndex) {
        return <div key={index} className="background current" style={{ backgroundImage: `url(/images/${image})` }} />;
      }
      if (index === imageIndex - 1 || (index === images.length - 1 && imageIndex === 0)) {
        return <div key={index} className="background prev" style={{ backgroundImage: `url(/images/${image})` }} />;
      }
      if (index === imageIndex + 1 || (index === 0 && imageIndex === images.length - 1)) {
        return <div key={index} className="background next" style={{ backgroundImage: `url(/images/${image})` }} />;
      }
      return null;
    });
    return (
      <div className="StreamArea">
        {imageElements}
        {streams}
        <Overlay />
      </div>
    );
  }
}
