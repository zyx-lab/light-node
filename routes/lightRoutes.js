const express = require('express');
const lightValidator = require('../validator/lightValidator');
const lightController = require('../controllers/lightController');

const { inStock, process, close } = lightController;

const router = express.Router();

router
  .patch('/in_stock', lightValidator.inStock, inStock)
  .patch('/process', lightValidator.process, process)
  .patch('/close', lightValidator.close, close);

module.exports = router;
