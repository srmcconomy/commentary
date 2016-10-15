// @flow

module.exports = {
  ports: {
    webpack: 8000,
    express: 5092
  },
  build: {
    babel: {
      client: {
        dev: {
          presets: ['es2017', 'es2015', 'react', 'stage-0'],
          plugins: ['transform-decorators-legacy'],
        },
        prod: {
          presets: ['es2017', 'es2015', 'react', 'stage-0'],
          plugins: ['transform-decorators-legacy']
        }
      },
      server: {
        dev: {
          presets: ['es2017', 'node6', 'react', 'stage-0'],
          plugins: ['transform-decorators-legacy']
        },
        prod: {
          presets: ['es2017', 'node6', 'react', 'stage-0'],
          plugins: ['transform-decorators-legacy']
        }
      }
    },
    sass: {
      style: 'compact',
      includePaths: ['./assets/css', './node_modules'],
    },
    autoprefixer: {
      browsers: ['> 5%'],
    }
  },
  files: {
    client: {
      entry: './src/client.jsx',
      src: './src/**/**/*.js?(x)',
      out: 'js',
      outFile: 'bundle.js'
    },
    server: {
      src: './src/**/**/*.js?(x)',
      out: 'build'
    },
    css: {
      entry: './assets/scss/main.scss',
      src: './assets/scss/**/**/*.scss',
      out: 'css',
    },
    staticAssets: 'build/static/'
  }
};
