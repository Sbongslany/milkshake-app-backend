const express = require('express');
const { getConfig, updateConfig } = require('../controllers/configController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const router = express.Router();

router.get('/', auth, getConfig);
router.patch('/', auth, role('manager'), updateConfig);

module.exports = router;