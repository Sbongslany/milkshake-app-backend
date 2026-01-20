
const auditLogger = require('../utils/auditLogger');

const createLookupHandler = (Model, entityName) => ({
    getAll: async (req, res) => {
        const items = await Model.find({ active: true });
        res.json(items);
    },

    create: async (req, res) => {
        // Prevent duplicate name
        const existing = await Model.findOne({ name: req.body.name?.trim() });
        if (existing) {
            return res.status(409).json({
                message: `${entityName} "${req.body.name}" already exists`,
            });
        }

        const item = await Model.create(req.body);
        await auditLogger(req.user.id, `CREATED_${entityName.toUpperCase()}`, entityName, item._id);
        res.status(201).json(item);
    },

    update: async (req, res) => {
        // Prevent duplicate name on update (excluding current item)
        if (req.body.name) {
            const existing = await Model.findOne({
                name: req.body.name.trim(),
                _id: { $ne: req.params.id },
            });
            if (existing) {
                return res.status(409).json({
                    message: `${entityName} "${req.body.name}" already exists`,
                });
            }
        }

        const oldItem = await Model.findById(req.params.id);
        if (!oldItem) {
            return res.status(404).json({ message: `${entityName} not found` });
        }

        const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });

        const changes = Object.keys(req.body).map(field => ({
            field,
            oldValue: oldItem[field],
            newValue: item[field],
        }));

        await auditLogger(req.user.id, `UPDATED_${entityName.toUpperCase()}`, entityName, item._id, changes);
        res.json(item);
    },

    deactivate: async (req, res) => {
        const item = await Model.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: `${entityName} not found` });
        }

        const updated = await Model.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
        await auditLogger(req.user.id, `DEACTIVATED_${entityName.toUpperCase()}`, entityName, updated._id);
        res.json(updated);
    },
});

module.exports = {
    flavour: createLookupHandler(require('../models/Flavour'), 'Flavour'),
    topping: createLookupHandler(require('../models/Topping'), 'Topping'),
    consistency: createLookupHandler(require('../models/Consistency'), 'Consistency'),
    restaurant: createLookupHandler(require('../models/Restaurant'), 'Restaurant'),
};