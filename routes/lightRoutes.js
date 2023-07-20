const express = require('express');
const userValidator = require('../validator/light');
const lightController = require('../controllers/lightController');

const { inStock } = lightController;

const router = express.Router();

router.post('/in_stock', userValidator.inStock, inStock);

module.exports = router;
