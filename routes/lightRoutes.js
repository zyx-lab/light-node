const express = require('express');
const lightValidator = require('../validator/lightValidator');
const lightController = require('../controllers/lightController');

const { createTask, process, openLight, blinkLight, closeLight } =
  lightController;

const router = express.Router();

router
  .patch('/create_task', lightValidator.createTask, createTask)
  .patch('/process', lightValidator.process, process)
  .post('/open', lightValidator.openLight, openLight)
  .post('/blink', lightValidator.blinkLight, blinkLight)
  .post('/close', lightValidator.closeLight, closeLight);

module.exports = router;
