[![Build report](https://github.com/vivaldi-va/testcafe-html-report/actions/workflows/runaction.yml/badge.svg)](https://github.com/vivaldi-va/testcafe-html-report/actions/workflows/runaction.yml)

## Testcafe HTML report action

Uses JSON report output from [Testcafe](https://github.com/DevExpress/testcafe) to build an HTML report, to be deployed via some kind of CI at your discretion.

## Usage

1. Install [TestCafe JSON reporter](https://www.npmjs.com/package/testcafe-reporter-json)

`npm i --save-dev testcafe-reporter-json`

`yarn add -D testcafe-reporter-json`


2. add json reporter to your testcafe config

```json
  {
    // ...
    "reporter": [
      {
        "name": "list"
      },
      {
        "name": "json",
        "output": "path/to/report.json"
      }
    ],
    // ...
  }
```
3. add report generation to action yaml

```yaml

    # some_action.yml

    - name: Build HTML report
      uses: vivaldi-va/testcafe-html-report@v1
      with:
        json_report: path/to/report.json
```

## Development

To start the test server for the report HTML output:

```
npx gulp watch \
  --file test/example.json # test report JSON to use
```

Optionally, set the `GITHUB_WORKSPACE` env var to replicate the path modification used during run-time

## Deploying

after modification of the run-time script, run `npm run prepare` to construct a self-contained javascript file, so it can be executed without needing explicit installation of dependencies.

