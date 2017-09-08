import React, { Component } from 'react';
import { connect } from 'react-redux';

import Toolbar from './Toolbar';
import StreamArea from './StreamArea';

import styles from './app.scss';

class Edit extends Component {
  render() {
    return (
      <div className={styles.app}>
        <Toolbar />
        <StreamArea />
      </div>
    );
  }
}

export default connect(
  state => ({ aspect: state.aspect }),
)(Edit);
