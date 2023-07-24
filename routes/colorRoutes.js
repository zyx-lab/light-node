const express = require('express');
const colorValidator = require('../validator/colorValidator');
const colorController = require('../controllers/colorController');

const { createColor, deleteColor, updateColor, getAllColors, getColor } =
  colorController;

const router = express.Router();

router
  .post('/create', colorValidator.createColor, createColor)
  .delete('/delete/:id', deleteColor)
  .patch('/update', colorValidator.upateColor, updateColor)
  .get('/list', getAllColors)
  .get('/detail/:id', getColor);

module.exports = router;
