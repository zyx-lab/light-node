const { body } = require('express-validator');
const validate = require('../middleware/validate');

exports.create = validate([
  body('shelfId').notEmpty().withMessage('shelfId不能为空'),
  body('lightId').notEmpty().withMessage('lightId不能为空'),
]);

exports.update = validate([
  body('lightId').notEmpty().withMessage('lightId不能为空'),
]);
