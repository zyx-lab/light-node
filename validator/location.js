const { body } = require('express-validator');
const validate = require('../middleware/validate');

exports.create = validate([
  body('locationId').notEmpty().withMessage('locationId不能为空'),
  body('shelfId').notEmpty().withMessage('shelfId不能为空'),
  body('lightId').notEmpty().withMessage('lightId不能为空'),
]);
