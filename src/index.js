const fs = require('fs');
const path = require('path');
const copy = require('copyfiles');
const pug = require('pug');
const { getInput } = require('@actions/core');
const { parseData } = require('./utils');

const root = path.resolve(__dirname, '..');
const paths = {
  src: path.resolve(__dirname, '../', 'src'),
  build: path.join(__dirname, '../', 'build'),
};

if (!fs.existsSync(paths.build)) {
  fs.mkdirSync(paths.build);
}

function getScreenshotPaths(report) {
  let paths = [];
  report.fixtures.forEach((fixture) => {
    fixture.tests.forEach((test) => {
      if (test.screenshotPath) {
        paths.push(test.screenshotPath);
      }
    });
  });

  return paths;
}

async function copyScreenshots(report) {
  const paths = getScreenshotPaths(report);
  return new Promise((resolve, reject) => {
    copy([...paths, 'build'], (err) => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
}
async function copyAssets() {
  return new Promise((resolve, reject) => {
    fs.copyFile(path.join(paths.src, 'styles.css'), path.join(paths.build, 'styles.css'), (err) => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
}

async function run() {
  const writeStream = fs.createWriteStream(path.join(paths.build, 'index.html'));
  const templatePath = path.join(paths.src, 'templates/index.pug');

  const jsonPath = getInput('json_report');
  const jsonReport = JSON.parse(fs.readFileSync(jsonPath));

  const compileFunction = pug.compileFile(templatePath, { pretty: true });

  const compiledTemplate = compileFunction(parseData(jsonReport));
  writeStream.write(compiledTemplate);
  writeStream.end();

  await copyAssets();
  await copyScreenshots(jsonReport);
}

try {
  run();
} catch (err) {
  throw err;
}
