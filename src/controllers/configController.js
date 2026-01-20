const Config = require('../models/Config');
const auditLogger = require('../utils/auditLogger');

exports.getConfig = async (req, res) => {
    const config = await Config.getConfig();
    res.json(config);
};

exports.updateConfig = async (req, res) => {
    const oldConfig = await Config.getConfig();
    const newConfig = await Config.findOneAndUpdate({}, req.body, { new: true, upsert: true });

    const changes = Object.keys(req.body).map(field => ({
        field,
        oldValue: oldConfig[field],
        newValue: newConfig[field],
    }));

    await auditLogger(req.user.id, 'UPDATED_CONFIG', 'Config', newConfig._id, changes);
    res.json(newConfig);
};