const AuditLog = require('../models/AuditLog');

const auditLogger = async (userId, action, entity, entityId, changes = []) => {
    await AuditLog.create({
        user: userId || null,
        action,
        entity,
        entityId,
        changes,
    });
};

module.exports = auditLogger;