const express = require('express');
const lightValidator = require('../validator/lightValidator');
const lightController = require('../controllers/lightController');

const { createTask, process, openLight, blinkLight, closeLight } =
  lightController;

const router = express.Router();

router
  .patch('/create_task', lightValidator.createTask, createTask)
  .patch('/process', lightValidator.process, process)
  .patch('/open', lightValidator.openLight, openLight)
  .patch('/blink', lightValidator.blinkLight, blinkLight)
  .patch('/close', lightValidator.closeLight, closeLight)
  .patch('/close', lightValidator.close);

module.exports = router;
