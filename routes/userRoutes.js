const express = require('express');
const userController = require('../controllers/userController');

const userValidator = require('../validator/userValidator');

const { createUser, deleteUser } = userController;

const router = express.Router();

router
  .post('/create', userValidator.createUser, createUser)
  .delete('/delete/:userId', deleteUser);

module.exports = router;
