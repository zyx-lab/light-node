const express = require('express');
const shelfValidator = require('../validator/shelfValidator');
const shelfController = require('../controllers/shelfController');

const {
  saveShelf,
  deleteShelf,
  updateShelf,
  getAllShelves,
  getShelf,
  openLight,
  blinkLight,
  closeLight,
} = shelfController;

const router = express.Router();

router
  .post('/save', shelfValidator.save, saveShelf)
  .get('/delete', deleteShelf)
  .patch('/update/:shelfId', shelfValidator.update, updateShelf)
  .get('/list', shelfValidator.getAll, getAllShelves)
  .get('/detail/:shelfId', getShelf)
  .post('/open', shelfValidator.openLight, openLight)
  .post('/blink', shelfValidator.blinkLight, blinkLight)
  .post('/close', shelfValidator.closeLight, closeLight);

module.exports = router;
