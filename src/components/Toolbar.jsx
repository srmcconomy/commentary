// @flow

import React, { Component } from 'react';

import AspectTool from './AspectTool';
import ClipTool from './ClipTool';
import MoveTool from './MoveTool';
import OverlayTool from './OverlayTool';
import SRLTool from './SRLTool';
import StreamTool from './StreamTool';
import TransformTool from './TransformTool';

export default class Toolbar extends Component {
  render() {
    return (
      <div className="Toolbar">
        <div className="title">
          Commentary Helper
        </div>
        <SRLTool />
        <StreamTool />
        <TransformTool />
        <MoveTool />
        <OverlayTool />
        <ClipTool />
        <AspectTool />
      </div>
    );
  }
}
