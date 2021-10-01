const fs = require('fs');
const { copyFile } = require('fs/promises');
const pug = require('pug');
const { getInput } = require('@actions/core');

if (!fs.existsSync('build')) {
  fs.mkdirSync('build');
}

async function copyAssets() {
  return copyFile('src/styles.css', 'build/styles.css');
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
}

try {
  run();
} catch (err) {
  throw err;
}
