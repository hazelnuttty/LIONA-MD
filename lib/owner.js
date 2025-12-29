const config = require('../config.js');

function isOwner(userId) {
    const ownerIds = Array.isArray(config.ownerId) ? config.ownerId : [config.ownerId];
    return ownerIds.map(String).includes(String(userId));
}

module.exports = { isOwner };
