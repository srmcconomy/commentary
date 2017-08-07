const gulp = require('gulp');
const gutil = require('gulp-util');
const size = require('gulp-size')
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const babel = require('gulp-babel');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./webpack.config');
const webpackConfigServer = require('./webpack.config.server');
const babelConfigNode = require('./babel.config').node;
const fs = require('fs');
const path = require('path');
const pretty = require('prettysize');
const config = require('./config');
const nodemon = require('nodemon');
const spawn = require('child_process').spawn;

gulp.task('build:server', cb => {
  // gulp.src('./src/server.jsx')
  //   .pipe(plumber())
  //   .pipe(sourcemaps.init())
  //   .pipe(babel(babelConfigNode))
  //   .pipe(sourcemaps.write())
  //   .pipe(size({ showFiles: true, title: 'Server' }))
  //   .pipe(gulp.dest(config.serverOutputPath))

  webpack(webpackConfigServer, (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      cb();
    }

    const info = stats.toJson();
    if (stats.hasErrors()) {
      console.error(info.errors);
    }
    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }
    const files = fs.readdirSync(config.serverOutputPath, 'utf8');
    let totalSize = 0;
    for (let file of files) {
      const size = fs.statSync(path.resolve(config.serverOutputPath, file)).size
      totalSize += size;
      gutil.log(`${gutil.colors.cyan(file)} ${gutil.colors.magenta(pretty(size))}`)
    }
    gutil.log(`${gutil.colors.cyan('Client JS')} ${gutil.colors.green('all files')} ${gutil.colors.magenta(pretty(totalSize))}`)

    cb();
  });
});

gulp.task('build:client', cb => {
  webpack(webpackConfig, (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      cb();
    }

    const info = stats.toJson();
    if (stats.hasErrors()) {
      console.error(info.errors);
    }
    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }
    const files = fs.readdirSync(config.clientOutputPath, 'utf8');
    let totalSize = 0;
    for (let file of files) {
      const size = fs.statSync(path.resolve(config.clientOutputPath, file)).size
      totalSize += size;
      gutil.log(`${gutil.colors.cyan(file)} ${gutil.colors.magenta(pretty(size))}`)
    }
    gutil.log(`${gutil.colors.cyan('Client JS')} ${gutil.colors.green('all files')} ${gutil.colors.magenta(pretty(totalSize))}`)

    cb();
  });
});

gulp.task('watch:client', cb => {
  const child = spawn(`${__dirname}/node_modules/.bin/webpack-dev-server`, { stdio: [, 'pipe']});
  child.stdout.on('data', chunk => {
    const s = chunk.toString();
    if (s.match(/^webpack: Compiled successfully/)) {
      gutil.log('Webpack compilation successful');
      const files = fs.readdirSync(config.clientOutputPath, 'utf8');
      let totalSize = 0;
      for (let file of files) {
        const size = fs.statSync(path.resolve(config.clientOutputPath, file)).size
        totalSize += size;
        // gutil.log(`${gutil.colors.cyan(file)} ${gutil.colors.magenta(pretty(size))}`)
      }
      gutil.log(`${gutil.colors.cyan('Client JS')} ${gutil.colors.green('all files')} ${gutil.colors.magenta(pretty(totalSize))}`);
    }
    if (s.match(/^webpack: Compiling\.\.\./)) {
      gutil.log('Recompiling...');
    }
  });

  cb();
});

gulp.task('watch:server', ['build:server'], () => {
  gulp.watch('./src/**/*.js?(x)', ['build:server']);
});

gulp.task('run', ['watch:client', 'watch:server'], cb => {
  nodemon({
    script: 'build/app.js',
    watch: 'build',
  })
})
