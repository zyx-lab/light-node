const express = require('express');
const lightValidator = require('../validator/lightValidator');
const lightController = require('../controllers/lightController');

const { inStock, process, close, outStock, checkStock } = lightController;

const router = express.Router();

router
  .patch('/in_stock', lightValidator.inStock, inStock)
  .patch('/process', lightValidator.process, process)
  .patch('/close', lightValidator.close, close)
  .patch('/out_stock', lightValidator.outStock, outStock)
  .patch('/check_stock', lightValidator.checkStock, checkStock);

module.exports = router;
