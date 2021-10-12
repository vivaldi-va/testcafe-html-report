const fs = require('fs');
const path = require('path');
const pug = require('pug');
const { getInput } = require('@actions/core');
const { parseData, copyFile } = require('./utils');

const paths = {
  src: path.resolve(__dirname, '../', 'src'),
  build: process.env.GITHUB_WORKSPACE
    ? path.join(process.env.GITHUB_WORKSPACE, 'build')
    : path.join(__dirname, '../', 'build'),
};

if (!fs.existsSync(paths.build)) {
  fs.mkdirSync(paths.build, { recursive: true });
}

function getScreenshotPaths(report) {
  const screenshotPaths = [];
  report.fixtures.forEach((fixture) => {
    fixture.tests.forEach((test) => {
      if (test.screenshotPath) {
        screenshotPaths.push(test.screenshotPath);
      }
    });
  });

  return screenshotPaths;
}

async function copyScreenshots(report) {
  const screenshotPaths = getScreenshotPaths(report);

  return Promise.all(screenshotPaths.map((screenshotPath) => {
    const workspace = process.env.GITHUB_WORKSPACE;
    const dest = screenshotPath.replace(workspace, '');
    return copyFile(screenshotPath, path.join(paths.build, dest));
  }));
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

run();
