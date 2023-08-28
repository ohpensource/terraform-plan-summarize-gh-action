var fs = require('fs');
const glob = require('glob');


ghStepSummaryFile = 'tests/gh_step_summary.html'
let testFiles = [ghStepSummaryFile]

fs
    .readdirSync('tests')
    .filter(fn => fn.includes('summary-aggregated.'))
    .map(x => `tests/${x}`)
    .forEach(file => testFiles.push(file))

testFiles
    .forEach(file => {
        console.log(`BEFORE TEST: emptying file ${file}`)
        fs.writeFileSync(file, '', 'utf8')
    })