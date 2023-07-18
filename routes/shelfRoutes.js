const express = require('express');
const shelfValidator = require('../validator/shelf');
const shelfController = require('../controllers/shelfController');

const { createShelf, deleteShelf, updateShelf, getAllShelves, getShelf } =
  shelfController;

const router = express.Router();

router
  .post('/create', shelfValidator.create, createShelf)
  .delete('/delete/:shelfId', deleteShelf)
  .patch('/update/:shelfId', shelfValidator.update, updateShelf)
  .get('/list', getAllShelves)
  .get('/detail/:shelfId', getShelf);

module.exports = router;
