const express = require('express');
const locationValidator = require('../validator/locationValidator');
const locationController = require('../controllers/locationController');

const {
  createLocation,
  deleteLocation,
  updateLocation,
  getAllLocations,
  getLocation,
} = locationController;

const router = express.Router();

router
  .post('/create', locationValidator.create, createLocation)
  .delete('/delete/:locationId', deleteLocation)
  .patch('/update/:locationId', updateLocation)
  .get('/list', getAllLocations)
  .get('/detail/:locationId', getLocation);

module.exports = router;
