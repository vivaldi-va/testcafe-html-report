const fs = require('fs');
const path = require('path');
const humanizeDuration = require('humanize-duration');

module.exports.parseData = function parseData(data) {
  const duration = new Date(data.endTime).getTime() - new Date(data.startTime).getTime();
  const workspace = process.env.GITHUB_WORKSPACE;
  return {
    ...data,
    duration: humanizeDuration(duration, { round: true }),
    fixtures: data.fixtures.map((fixture) => ({
      ...fixture,
      hasErrors: fixture.tests.some(t => t.errs.length > 0),
      tests: fixture.tests.map((test) => ({
        ...test,
        // modify screenshot path to point to workspace volume path
        // https://github.community/t/how-can-i-access-the-current-repo-context-and-files-from-a-docker-container-action/17711/2
        screenshotPath: test.screenshotPath && test.screenshotPath
          .replace(workspace, '')
          .replace(/^\//, './'),
      }))
    }))
  }
}

module.exports.copyFile = function copyFile(src, dest) {
  // ensure destination directory exists
  const destPath = path.dirname(dest);
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    fs.copyFileSync(src, dest, (err) => {
      if (err) {
        return reject(err);
      }

      return resolve(dest);
    });
  });
}
