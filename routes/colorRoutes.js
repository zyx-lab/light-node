const express = require('express');
const colorValidator = require('../validator/colorValidator');
const colorController = require('../controllers/colorController');

const { createColor, deleteColor } = colorController;

const router = express.Router();

router
  .post('/create', colorValidator.createColor, createColor)
  .delete('/delete/:id', deleteColor);

module.exports = router;
