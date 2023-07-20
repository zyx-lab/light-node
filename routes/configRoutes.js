const express = require('express');
const configValidator = require('../validator/config');
const configController = require('../controllers/configController');

const { save } = configController;

const router = express.Router();

router.post('/save', configValidator.save, save);

module.exports = router;
