const { ACTIONS } = require("./constants");

const sensitiveProperties = [
    {
        propToCheck: "type",
        valueToCheck: "SecureString",
        propToMask: "value",
    },
];
const propertiesToOmit = ["tags", "tags_all"];
const actionsToOmit = [ACTIONS.none]

function getSummaryFilePrefix(environment) {
    return `${environment}-summary`
}

module.exports = {
    sensitiveProperties,
    propertiesToOmit,
    actionsToOmit,
    getSummaryFilePrefix
};