const express = require('express');
const areaController = require('../controllers/areaController');

const { bindLights, getArea } = areaController;

const router = express.Router();

router.patch('/bindLights', bindLights).get('/getArea/:id', getArea);

module.exports = router;
