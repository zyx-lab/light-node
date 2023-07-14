const express = require('express');
const shelfController = require('../controllers/shelfController');

const { createShelf, deleteShelf, updateShelf, getAllShelves, getShelf } =
  shelfController;

const router = express.Router();

router
  .post('/create', createShelf)
  .delete('/delete/:shelfId', deleteShelf)
  .patch('/update/:shelfId', updateShelf)
  .get('/list', getAllShelves)
  .get('/detail/:shelfId', getShelf);

module.exports = router;
