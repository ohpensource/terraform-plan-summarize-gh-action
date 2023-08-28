const { ACTIONS } = require('../constants');

function buildChangesSummary(environment, changes) {
    return {
        environment: environment,
        deleted: changes.filter((c) => c.action === ACTIONS.delete).length,
        created: changes.filter((c) => c.action === ACTIONS.create).length,
        updated: changes.filter((c) => c.action === ACTIONS.update).length,
        replaced: changes.filter((c) => actionIsReplace(c.action)).length,
    };
}

function actionIsReplace(action) {
    return (
        action === ACTIONS.createAndDelete || action === ACTIONS.deleteAndCreate
    );
}

module.exports = {
    buildChangesSummary
};

