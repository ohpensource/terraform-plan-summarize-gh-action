const artifact = require('@actions/artifact');
const core = require('@actions/core');
const { getSummaryFilePrefix } = require('./config.default');
const fs = require("fs");

async function run() {
  try {
    const artifactClient = artifact.create()
    const artifactRootDirectory = '.'
    const artifactUploadOptions = {
      continueOnError: false,
      retentionDays: 1
    }

    const environment = core.getInput('environment').replace('/', '-')
    const exportMarkdown = core.getBooleanInput('attach-markdown-summary')
    const exportCSV = core.getBooleanInput('attach-csv-summary')
    const exportJSON = core.getBooleanInput('attach-json-summary')

    const summaryFilePrefix = getSummaryFilePrefix(environment)
    const changesDetected = process.env['TF_PLAN_SUMMARY_DETECT_CHANGES'] === "true"
    console.log(`changesDetected: ${changesDetected}`)

    const artifacts = [
      {
        extension: "md",
        enabled: exportMarkdown && changesDetected,
        fileName: `${summaryFilePrefix}.md`
      },
      {
        extension: "csv",
        enabled: exportCSV && changesDetected,
        fileName: `${summaryFilePrefix}.csv`
      },
      {
        extension: "json",
        enabled: exportJSON,
        fileName: `${summaryFilePrefix}.json`
      }
    ]

    artifacts
      .filter(x => x.enabled && fs.existsSync(x.fileName))
      .forEach(async x => {
        const artifactName = `${environment}-summary-${x.extension}`
        console.log(`Uploading ${artifactName} artifact from ${x.fileName}`)
        await artifactClient.uploadArtifact(artifactName, [x.fileName], artifactRootDirectory, artifactUploadOptions)
      })
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()
