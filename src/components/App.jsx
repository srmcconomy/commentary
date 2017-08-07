import React, { Component } from 'react';
import { Link, Route } from 'react-router-dom';

import LazyComponent from './LazyComponent';

export default class App extends Component {
  render() {
    return (
      <div>
        <div>
          <Link to="/page1">Page 1</Link>
          <Link to="/page2">Page 2</Link>
        </div>
        <Route
          path="/page1"
          render={() => {
            return <LazyComponent
              resolveComponent={async () => (await import('./Page1')).default}
            />
          }
          }
        />
        <Route
          path="/page2"
          render={() => {
            return <LazyComponent resolveComponent={async () => (await import('./Page2')).default} />
          }}
        />
      </div>
    );
  }
}
