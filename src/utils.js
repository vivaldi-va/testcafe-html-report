const humanizeDuration = require('humanize-duration');

module.exports.parseData = function parseData(data) {
  const duration = new Date(data.endTime).getTime() - new Date(data.startTime).getTime();
  const workspace = process.env.GITHUB_WORKSPACE;
  return {
    ...data,
    duration: humanizeDuration(duration, { round: true }),
    fixtures: data.fixtures.map((fixture) => ({
      ...fixture,
      tests: fixture.tests.map((test) => ({
        ...test,
        // modify screenshot path to point to workspace volume path
        // https://github.community/t/how-can-i-access-the-current-repo-context-and-files-from-a-docker-container-action/17711/2
        screenshotPath: test.screenshotPath && test.screenshotPath
          .replace(workspace, ''),
      }))
    }))
  }
}
