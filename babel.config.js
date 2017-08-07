module.exports = {
  node: {
    presets: [
      ['env', {
        targets: { node: true },
      }],
      'react'
    ],
    plugins: ['dynamic-import-node', 'transform-class-properties'],
  },
  chrome: {
    presets: [
      ['env', {
        targets: { browsers: 'last 2 Chrome versions' },
        modules: false,
      }],
      'react'
    ],
    plugins: ['syntax-dynamic-import', 'transform-class-properties'],
  },
};
