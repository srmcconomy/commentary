import React, { Component } from 'react';
import propTypes from 'prop-types';

export default class LazyComponent extends Component {
  state = { loaded: false, Component: null };
  constructor(props, context) {
    super(props, context);
    this.id = this.context.asyncComponent.getNextID();
    if (context.asyncComponent.registry.hasOwnProperty(this.id)) {
      this.state = { loaded: true, Component: context.asyncComponent.registry[this.id] };
    } else {
      this.state = { loaded: false, Component: null };
    }
  }
  static contextTypes = {
    asyncComponent: propTypes.shape({
      getNextID: propTypes.func.isRequired,
      registry: propTypes.object,
    }),
  };

  async componentWillMount() {
    if (!this.state.loaded) {
      this.setState({ loaded: true, Component: await this.props.resolveComponent() });
    }
  }

  async prerender() {
    if (this.context.asyncComponent.registry.hasOwnProperty(this.id)) {
      return true;
    }
    this.context.asyncComponent.registry[this.id] = await this.props.resolveComponent();
    return true;
  }
  render() {
    return (
      this.state.loaded ?
        <this.state.Component {...this.props} /> :
        null
    );
  }
}
