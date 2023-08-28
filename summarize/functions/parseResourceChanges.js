const fs = require("fs");
const { sensitiveProperties, propertiesToOmit, actionsToOmit } = require('../config.default');
const { ACTIONS } = require('../constants');

function parseResourceChanges(planJSON, environment) {
    const jsonContent = fs.readFileSync(planJSON, "utf8");
    const jsonObject = JSON.parse(jsonContent);
    const resourceChanges = jsonObject.resource_changes ?? [];

    const changes = resourceChanges
        .map(compare)
        .map((c) => omitProperties(c, propertiesToOmit))
        .filter((c) => !actionsToOmit.includes(c.action))
        .map((c) => ({
            environment: environment,
            resource: c.resource,
            action: c.action,
            before: c.action === ACTIONS.create ? {} : c.before,
            after: c.action === ACTIONS.delete ? {} : c.after,
        }));
    return changes;
}

function getResourceValue(resource, key) {
    return (resource?.hasOwnProperty(key) ?? false) ? resource[key] : "UNDEFINED";
}

function isPropertySensitive(resource, propertyName, sensitiveProperties) {
    return sensitiveProperties.some(
        (p) => propertyName === p.propToMask &&
            (resource?.hasOwnProperty(p.propToCheck) ?? false) &&
            resource[p.propToCheck] === p.valueToCheck
    );
}
function getAction(actions) {
    if (actions.length > 1) return actions.join("+");
    return actions[0];
}

function compare(resourceChange) {
    const { change, address } = resourceChange;
    const { actions, before, after } = change;
    const action = getAction(actions);
    const keys = Object.keys(before ?? {}).concat(Object.keys(after ?? {}));
    let comparisonBefore = {};
    let comparisonAfter = {};
    keys.forEach((key) => {
        const beforeValue = getResourceValue(before, key);
        const afterValue = getResourceValue(after, key);
        if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
            comparisonBefore[key] = isPropertySensitive(
                before,
                key,
                sensitiveProperties
            )
                ? "***"
                : beforeValue;
            comparisonAfter[key] = isPropertySensitive(
                after,
                key,
                sensitiveProperties
            )
                ? "***"
                : afterValue;
        }
    });
    return {
        resource: address,
        action,
        before: comparisonBefore,
        after: comparisonAfter,
    };
}
function omitProperties(change, propertiesToOmit) {
    let newChange = change;
    newChange.before = Object.keys(change.before)
        .filter((key) => !propertiesToOmit.includes(key))
        .reduce((obj, key) => {
            obj[key] = change.before[key];
            return obj;
        }, {});
    newChange.after = Object.keys(change.after)
        .filter((key) => !propertiesToOmit.includes(key))
        .reduce((obj, key) => {
            obj[key] = change.after[key];
            return obj;
        }, {});
    const keys = Object.keys(newChange.before).concat(
        Object.keys(newChange.after)
    );
    newChange.action = keys.length > 0 ? newChange.action : ACTIONS.none;
    return newChange;
}

module.exports = {
    parseResourceChanges
}
