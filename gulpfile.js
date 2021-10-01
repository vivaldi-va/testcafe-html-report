const fs = require('fs');
const path = require('path');
const del = require('del');
const argv = require('yargs').argv;
const log = require('fancy-log');
const gulp = require('gulp');
const pug = require('gulp-pug');
const browserSync = require('browser-sync').create();

const paths = {
  src: 'src',
  dist: 'dist',
  tmp: '.tmp',
};

const { series } = gulp;

function handleError(err) {
  log.error(err.toString());
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

async function cleanDist() {
  try {
    const deletedPaths = await del([paths.dist]);
    log.info('cleaned paths:');
    deletedPaths.forEach((p) => log.info(` - ${p}`));
    return deletedPaths;
  } catch (err) {
    return handleError(err);
  }
}

function cleanData(data) {
  return {
    ...data,
    fixtures: data.fixtures.map((fixture) => ({
      ...fixture,
      tests: fixture.tests.map((test) => ({
        ...test,
        // modify screenshot path to point to workspace volume path
        // https://github.community/t/how-can-i-access-the-current-repo-context-and-files-from-a-docker-container-action/17711/2
        screenshotPath: test.screenshotPath
          .replace(/\/home\/runner\/work\/(?:\w|-)+\/(?:\w|-)+/, '/github/workplace'),
      }))
    }))
  }
}

function copyImages() {
  return gulp.src('test/**/*.{jpg,png}')
    .pipe(gulp.dest(paths.tmp));
}

function copyStyles() {
  return gulp.src(path.join(paths.src, '**/*.css'))
    .pipe(gulp.dest(paths.tmp));
}

function compilePug() {
  let dataPath = argv.file || paths.data;
  const data = fs.readFileSync(dataPath);
  return gulp.src(path.join(paths.src, 'templates/**/*.pug'))
    .pipe(pug({
      pretty: true,
      data: cleanData(JSON.parse(data)),
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

  gulp.watch(path.join(paths.src, '**/*.{pug,json}'), series(
    compilePug,
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
