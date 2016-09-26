'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _App = require('./components/App');

var _App2 = _interopRequireDefault(_App);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

global.navigator = { navigator: 'all' };

const app = (0, _express2.default)();
app.use('/assets/', _express2.default.static(_path2.default.join(__dirname, '../build/static')));

let jsFile;
if (process.env.NODE_ENV === 'production') {
  jsFile = `/assets/${ _config2.default.files.client.out }/${ _config2.default.files.client.outFile }`;
} else {
  jsFile = `http://localhost:${ _config2.default.ports.webpack }/${ _config2.default.files.client.out }/${ _config2.default.files.client.outFile }`;
}

app.use((req, res) => {
  const content = _server2.default.renderToString(_react2.default.createElement(_App2.default, null));
  res.send(`<html>
      <head>
        <link rel="stylesheet" href="/assets/css/main.css" />
      </head>
      <body>
        <div id="react-root">${ content }</div>
        <script async defer src="${ jsFile }"></script>
      </body>
    </html>`);
});

app.listen(_config2.default.ports.express, () => {
  console.log(`Listening on port ${ _config2.default.ports.express }`);
});
//# sourceMappingURL=server.js.map
