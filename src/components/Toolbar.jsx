import React, { Component } from 'react';
import SRLTool from './SRLTool';

import styles from './toolbar.scss';

export default class Toolbar extends Component {
  render() {
    return (
      <div className={styles.toolbar}>
        <div className="title">
          Commentary Helper
        </div>
        <SRLTool />
      </div>
    );
  }
}
