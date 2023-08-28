const core = require('@actions/core')
const { writeToCsv, writeToMarkdown, writeSummaryToGHStepSummary, writeResourceChangesToGHStepSummary } = require('./functions/writeTo');
const { aggregateStepsSummary } = require('./functions/aggregateStepsSummary');

async function run() {
  try {
    const printSummary = core.getBooleanInput('print-summary')
    const exportMarkdown = core.getBooleanInput('attach-markdown-summary')
    const exportCSV = core.getBooleanInput('attach-csv-summary')
    const summaryFilePrefix = "summary-aggregated"

    let { changes, summaries } = await aggregateStepsSummary();
    const resourcesHaveChanged = changes.length > 0
    core.exportVariable('TF_PLAN_AGGREGATE_DETECT_CHANGES', resourcesHaveChanged)
    console.log(`changes-detected:${resourcesHaveChanged}`)
    core.setOutput('changes-detected', resourcesHaveChanged)

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
        console.log(`creating ${fileName}`)
        x.writeFunction(fileName, changes)
        core.setOutput(x.output, fileName)
      })

    if (printSummary) {
      await writeSummaryToGHStepSummary(summaries)
      if (resourcesHaveChanged) await writeResourceChangesToGHStepSummary(changes)
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
