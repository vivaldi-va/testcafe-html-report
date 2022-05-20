const fs = require('fs');
const path = require('path');
const del = require('del');
const { argv } = require('yargs');
const log = require('fancy-log');
const chalk = require('chalk');
const gulp = require('gulp');
const pug = require('gulp-pug');
const browserSync = require('browser-sync').create();
const { parseData } = require('./src/utils');

const paths = {
  src: 'src',
  dist: 'dist',
  tmp: '.tmp',
};

const { series } = gulp;

function handleError(err) {
  log.error(chalk.red(err.toString()));
  this.emit('end');
}

async function cleanTmp() {
  try {
    const deletedPaths = await del([paths.tmp]);
    log.info('cleaned paths:');
    deletedPaths.forEach((p) => log.info(` - ${p}`));
    return deletedPaths;
  } catch (err) {
    return handleError(err);
  }
}

function copyImages() {
  return gulp.src('test/**/*.{jpg,png}', { base: '' })
    .pipe(gulp.dest(paths.tmp));
}

function copyStyles() {
  return gulp.src(path.join(paths.src, '**/*.css'))
    .pipe(gulp.dest(paths.tmp));
}

function compilePug() {
  const dataPath = argv.file || paths.data;
  if (!dataPath) {
    return Promise.reject(new Error(chalk.red('test data is required, use "--file path/to/data.json" supply it')));
  }
  const data = fs.readFileSync(dataPath);
  return gulp.src(path.join(paths.src, 'templates/**/*.pug'))
    .pipe(pug({
      pretty: true,
      data: parseData(JSON.parse(data)),
    }))
    .pipe(gulp.dest(paths.tmp));
}

function reload() {
  browserSync.reload();
  return Promise.resolve();
}

function watch(cb) {
  browserSync.init({
    server: paths.tmp,
    open: false,
    watch: false,
  });

  gulp.watch(path.join(paths.src, '**/*.{pug,json,css}'), series(
    compilePug,
    copyStyles,
    reload,
  ));

  gulp.watch(path.join(paths.src, './components/**/*.js'), series(compilePug, reload));

  return cb();
}

gulp.task('watch', series(
  cleanTmp,
  copyImages,
  copyStyles,
  compilePug,
  watch,
));
