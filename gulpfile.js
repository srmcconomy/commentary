const gulp = require('gulp');
const sass = require('gulp-sass');
const prefix = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
const browserSync = require('browser-sync');
const cache = require('gulp-cached');
const sourcemaps = require('gulp-sourcemaps');
const pretty = require('prettysize');
const size = require('gulp-size');
const nodemon = require('nodemon');
const plumber = require('gulp-plumber');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./config');
const reload = browserSync.reload;
const del = require('del');
const runSequence = require('run-sequence');
const gutil = require('gulp-util');
const path = require('path');
const fs = require('fs');
const flow = require('gulp-flowtype');

const webpackDevConfig = require('./webpack.dev.client');
const webpackDevCompiler = webpack(webpackDevConfig);

const webpackProdConfig = require('./webpack.client');
const webpackProdCompiler = webpack(webpackProdConfig);


let isRunningDevServer = false;

gulp.task('build:css', () =>
  gulp.src(config.files.css.entry)
    .pipe(plumber())
    .pipe(sass(config.build.sass))
    .pipe(prefix(config.build.autoprefixer))
    .pipe(size({ title: 'CSS' }))
    .pipe(gulp.dest(`${config.files.staticAssets}${config.files.css.out}`))
    .pipe(reload({ stream: true }))
);

gulp.task('build:lint', () =>
  gulp.src(config.files.client.src)
    .pipe(cache('build:lint'))
    .pipe(eslint())
    .pipe(eslint.format())
);

gulp.task('build:lint:prod', () =>
  gulp.src(config.files.client.src)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
);

gulp.task('build:flow', () =>
  gulp.src(config.files.client.src)
    .pipe(cache('build:flow'))
    .pipe(flow())
);

/**
 * Compile our server files for development.
 */
gulp.task('build:server', () =>
  gulp.src(config.files.server.src)
    .pipe(cache('src:server'))
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel(config.build.babel.server.dev))
    .pipe(sourcemaps.write('.'))
    .pipe(size({ title: 'Server JS' }))
    .pipe(gulp.dest(config.files.server.out))
);

/**
 * Compile our server files for production.
 */
gulp.task('build:server:prod', () =>
  gulp.src(config.files.server.src)
    .pipe(cache('src:server'))
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel(config.build.babel.server.prod))
    .pipe(sourcemaps.write('.'))
    .pipe(size({ title: 'Server JS' }))
    .pipe(gulp.dest(config.files.server.out))
);

gulp.task('build:client', callback => {
  // Run webpack
  webpackDevCompiler.run(err => {
    if (err) throw new gutil.PluginError('build:client', err);

    // Emulate gulp-size and ignore errors
    try {
      const outputConfig = webpackDevConfig.output;
      const jsFilePath = path.join(outputConfig.path, outputConfig.filename);
      gutil.log(`${gutil.colors.cyan('Client JS')} ${gutil.colors.green('all files ')}` +
                `${gutil.colors.magenta(pretty(fs.statSync(jsFilePath).size))}`);
    } catch (e) {
      // Continue regardless of error
    }

    // Set boolean to true if we're not running the server.
    if (!isRunningDevServer) {
      isRunningDevServer = true;

      // Start the dev server. We have to make sure we send a new instance of the webpack compiler.
      const devServer = new WebpackDevServer(webpack(webpackDevConfig), webpackDevConfig.devServer);
      devServer.listen(config.ports.webpack, 'localhost', serverErr => {
        if (serverErr) throw new gutil.PluginError('webpack-dev-server', serverErr);
      });
    }

    // Call callback when done
    callback();
  });
});

gulp.task('build:client:prod', callback => {
  // Run webpack
  webpackProdCompiler.run(err => {
    if (err) throw new gutil.PluginError('build:client:prod', err);

    // Emulate gulp-size
    const outputConfig = webpackProdConfig.output;
    const jsFilePath = path.join(outputConfig.path, outputConfig.filename);
    gutil.log(`'${gutil.colors.cyan('Client Prod JS')}' ${gutil.colors.green('all files ')}` +
              `${gutil.colors.magenta(pretty(fs.statSync(jsFilePath).size))}`);

    callback();
  });
});

/**
 * Clean out build folder so we are sure we're not building from some cache.
 */
gulp.task('clean', callback => {
  del(['build']).then(() => {
    callback();
  });
});

/**
 * Task to compile our files for production.
 */
gulp.task('compile', callback => {
  runSequence('clean', 'build:lint:prod', [
    'build:client:prod',
    'build:server:prod',
  ], callback);
});

gulp.task('watch', ['clean'], callback => {
  runSequence(
    'build:lint',
    'build:flow', [
      'build:css',
      'build:client',
      'build:server',
    ], () => {
      // Watch files
      gulp.watch(config.files.client.src, ['build:client']);
      gulp.watch(config.files.server.src, ['build:server']);
      gulp.watch(config.files.client.src, ['build:lint']);
      gulp.watch(config.files.client.src, ['build:flow']);
      gulp.watch(config.files.css.src, ['build:css']);

      // Launch Nodemon
      nodemon({
        script: 'build/server.js',
        env: { NODE_ENV: 'development' },
        watch: [config.files.server.out],
        ignore: [config.files.staticAssets],
      });

      // Boolean to check if BrowserSync has started.
      let isBrowserSyncStarted = false;

      // Perform action right when nodemon starts
      nodemon.on('start', () => {
        // Only perform action when boolean is false
        if (!isBrowserSyncStarted) {
          isBrowserSyncStarted = true;

          // Set a timeout of 500 ms so that the server has time to start
          setTimeout(() => {
            // Launch BrowserSync
            browserSync({
              proxy: `localhost:${config.ports.express}`,
              open: false,
            });

            // Call callback function to end gulp task
            callback();
          }, 500);
        }
      });
    }
  );
});
