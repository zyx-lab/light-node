const express = require('express');
const locationValidator = require('../validator/locationValidator');
const locationController = require('../controllers/locationController');

const {
  saveLocation,
  deleteLocation,
  updateLocation,
  getAllLocations,
  getLocation,
} = locationController;

const router = express.Router();

router
  .post('/save', locationValidator.save, saveLocation)
  .get('/delete', deleteLocation)
  .patch('/update/:locationId', updateLocation)
  .get('/list', getAllLocations)
  .get('/detail/:locationId', getLocation);

module.exports = router;
