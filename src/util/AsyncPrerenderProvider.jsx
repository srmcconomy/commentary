import React, { Component } from 'react';
import propTypes from 'prop-types';

export default class AsyncPrerendererProvider extends Component {
  constructor(props) {
    super(props);
  }
  static childContextTypes = {
    asyncComponent: propTypes.shape({
      getNextID: propTypes.func.isRequired,
      registry: propTypes.object,
    }),
  };
  getChildContext() {
    let id = 0;
    return {
      asyncComponent: {
        getNextID: () => id++,
        registry: this.props.registry,
      }
    }
  }

  render() {
    return React.Children.only(this.props.children);
  }
}
