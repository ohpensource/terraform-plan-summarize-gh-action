const glob = require('@actions/glob');
const fs = require("fs");


async function aggregateStepsSummary() {
    let summaries = [];
    let changes = [];

    const findJsonSummaries = await glob.create('./*-summary-json/*-summary.json');
    for await (const file of findJsonSummaries.globGenerator()) {
        console.log(`matching summary in ${file}`);
        const content = fs.readFileSync(file, "utf8");
        const stepData = JSON.parse(content);
        summaries.push(stepData.summary);
        changes = changes.concat(stepData.changes);
    }
    return { changes, summaries };
}
exports.aggregateStepsSummary = aggregateStepsSummary;
