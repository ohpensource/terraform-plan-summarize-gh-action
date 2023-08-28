const fs = require("fs");
const core = require('@actions/core');

function writeToCsv(planCsv, aggregatedChanges) {
    fs.writeFileSync(planCsv, "", "utf8")
    const headers = "environment;resource;action;before;after";
    appendLine(planCsv, headers);
    aggregatedChanges.forEach((c) => {
        const before = JSON.stringify(c.before);
        const after = JSON.stringify(c.after);
        const line = `${c.environment};${c.resource};${c.action};${before};${after}`;
        appendLine(planCsv, line);
    });
}

function writeToMarkdown(planMarkdown, aggregatedChanges) {
    fs.writeFileSync(planMarkdown, "", "utf8")
    appendLine(
        planMarkdown,
        "| environment | resource | action | before | after |"
    );
    appendLine(planMarkdown, "|-|-|-|-|-|");
    aggregatedChanges.forEach((c) => {
        const before = sanitizeMarkdownColumnSymbol(
            `\`${JSON.stringify(c.before)}\``
        );
        const after = sanitizeMarkdownColumnSymbol(
            `\`${JSON.stringify(c.after)}\``
        );
        const resource = sanitizeMarkdownColumnSymbol(`\`${c.resource}\``);
        const action = `\`${c.action}\``;
        const line = `| ${c.environment} | ${resource} | ${action} | ${before} | ${after} |`;
        appendLine(planMarkdown, line);
    });
}

function appendLine(file, line) {
    fs.appendFileSync(file, line + "\n", "utf8");
}

function sanitizeMarkdownColumnSymbol(text) {
    return text.replace(/\|/g, "\\|");
}

async function writeSummaryToGHStepSummary(summary) {
    const summaryTable = [
        [
            { data: 'environment', header: true },
            { data: 'deleted', header: true },
            { data: 'created', header: true },
            { data: 'updated', header: true },
            { data: 'replaced', header: true }
        ],
        [
            summary.environment.toString(),
            summary.deleted.toString(),
            summary.created.toString(),
            summary.updated.toString(),
            summary.replaced.toString()
        ]
    ];

    await core.summary
        .addHeading(`${summary.environment} summary`)
        .addTable(summaryTable)
        .write()
}

async function writeResourceChangedToGHStep(changes) {
    let resourceChangedTable = [
        [
            { data: 'environment', header: true },
            { data: 'resource', header: true },
            { data: 'action', header: true },
            { data: 'before', header: true },
            { data: 'after', header: true }
        ]
    ];

    for (const resourcesChange of changes) {
        resourceChangedTable.push([
            resourcesChange.environment,
            resourcesChange.resource,
            resourcesChange.action,
            `<pre lang="json"><code>${JSON.stringify(resourcesChange.before, null, 2)}</code></pre>`,
            `<pre lang="json"><code>${JSON.stringify(resourcesChange.after, null, 2)}</code></pre>`
        ]);
    }

    await core.summary
        .addHeading(`Resources changed`)
        .addTable(resourceChangedTable)
        .write()
}


module.exports = {
    writeToMarkdown,
    writeToCsv,
    writeSummaryToGHStepSummary,
    writeResourceChangedToGHStep
}