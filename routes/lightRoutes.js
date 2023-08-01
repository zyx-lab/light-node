const express = require('express');
const lightValidator = require('../validator/lightValidator');
const lightController = require('../controllers/lightController');

const { createTask, process } = lightController;

const router = express.Router();

router
  .patch('/create_task', lightValidator.createTask, createTask)
  .patch('/process', lightValidator.process, process)
  .patch('/close', lightValidator.close);

module.exports = router;
