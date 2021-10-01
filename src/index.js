const fs = require('fs');
const copy = require('copyfiles');
const pug = require('pug');
const { getInput } = require('@actions/core');

if (!fs.existsSync('build')) {
  fs.mkdirSync('build');
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
  console.log({ paths })
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
    fs.copyFile('src/styles.css', 'build/styles.css', (err) => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
}

async function run() {
  const writeStream = fs.createWriteStream('build/index.html');
  const templatePath = 'src/templates/index.pug';

  const jsonPath = getInput('json_report');
  const jsonReport = JSON.parse(fs.readFileSync(jsonPath));

  const compileFunction = pug.compileFile(templatePath, { pretty: true });

  const compiledTemplate = compileFunction(jsonReport);
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
