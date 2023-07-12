const express = require('express');
const areaController = require('../controllers/areaController');

const { bindLights } = areaController;

const router = express.Router();

router.patch('/bindLights', bindLights);

module.exports = router;
