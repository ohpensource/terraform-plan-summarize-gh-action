const artifact = require('@actions/artifact');
const core = require('@actions/core');
const fs = require("fs");

try {
  const exportMarkdown = core.getBooleanInput('attach-markdown-summary')
  const exportCSV = core.getBooleanInput('attach-csv-summary')

  const summaryFilePrefix = "summary-aggregated"
  const artifactClient = artifact.create()
  const artifactRootDirectory = '.'
  const artifactUploadOptions = {
    continueOnError: false,
    retentionDays: 1
  }

  const changesDetected = process.env['TF_PLAN_AGGREGATE_DETECT_CHANGES'] === "true"
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
    }
  ]

  artifacts
    .filter(x => x.enabled && fs.existsSync(x.fileName))
    .forEach(async x => {
      const artifactName = `${summaryFilePrefix}-${x.extension} `
      console.log(`Uploading ${artifactName} artifact from ${x.fileName} `)
      await artifactClient.uploadArtifact(artifactName, [x.fileName], artifactRootDirectory, artifactUploadOptions)
    })
} catch (error) {
  core.setFailed(error.message);
}
