const express = require('express');
const areaController = require('../controller/areaController');

const { bindLights } = areaController;

const router = express.Router();

router.patch('/bindLights', bindLights);

module.exports = router;
