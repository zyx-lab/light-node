const express = require('express');
const colorValidator = require('../validator/colorValidator');
const colorController = require('../controllers/colorController');

const { createColor, updateColor, deleteColor } = colorController;

const router = express.Router();

router
  .post('/create', colorValidator.createColor, createColor)
  .patch('/update', colorValidator.upateColor, updateColor)
  .delete('/delete/:id', deleteColor);

module.exports = router;
