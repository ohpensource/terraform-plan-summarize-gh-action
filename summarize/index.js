const core = require('@actions/core');
const fs = require("fs");
const { getSummaryFilePrefix } = require('./config.default');
const { writeToMarkdown, writeToCsv, writeSummaryToGHStepSummary, writeResourceChangedToGHStep } = require('./functions/writeTo');
const { parseResourceChanges, } = require('./functions/parseResourceChanges');
const { buildChangesSummary } = require('./functions/buildChangesSummary');

async function run() {
  try {
    const planJSON = core.getInput('json-terraform-plan-file')
    const environment = core.getInput('environment').replace('/', '-')
    const printSummary = core.getBooleanInput('print-summary')
    const exportMarkdown = core.getBooleanInput('attach-markdown-summary')
    const exportCSV = core.getBooleanInput('attach-csv-summary')
    const exportJSON = core.getBooleanInput('attach-json-summary')

    const changes = parseResourceChanges(planJSON, environment)
    const resourcesHaveChanged = changes.length > 0
    core.exportVariable('TF_PLAN_SUMMARY_DETECT_CHANGES', resourcesHaveChanged)
    core.setOutput('changes-detected', resourcesHaveChanged)
    const summary = buildChangesSummary(environment, changes)

    const summaryFilePrefix = getSummaryFilePrefix(environment)

    summaryFormats = [
      {
        extension: "md",
        enabled: exportMarkdown && resourcesHaveChanged,
        writeFunction: writeToMarkdown,
        output: "markdown-summary-file"
      },
      {
        extension: "csv",
        enabled: exportCSV && resourcesHaveChanged,
        writeFunction: writeToCsv,
        output: "csv-summary-file"
      }
    ]

    summaryFormats
      .filter(x => x.enabled)
      .forEach(x => {
        fileName = `${summaryFilePrefix}.${x.extension}`
        x.writeFunction(fileName, changes)
        core.setOutput(x.output, fileName)
      })

    if (exportJSON) {
      jsonSummaryFile = `${summaryFilePrefix}.json`
      jsonContent = {
        summary: summary,
        changes: changes
      }
      fs.writeFileSync(jsonSummaryFile, JSON.stringify(jsonContent, null, 2), "utf8")
      core.setOutput("json-summary-file", jsonSummaryFile)
    }

    if (printSummary) {
      await writeSummaryToGHStepSummary(summary)
      if (resourcesHaveChanged) await writeResourceChangedToGHStep(changes)
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()

