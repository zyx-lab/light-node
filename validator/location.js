const { body } = require('express-validator');
const validate = require('../middleware/validate');

exports.create = validate([
  body('locationId')
    .notEmpty()
    .withMessage('locationId不能为空')
    .isString()
    .withMessage('locationId为字符串类型'),
  body('shelfId')
    .notEmpty()
    .withMessage('shelfId不能为空')
    .isString()
    .withMessage('shelfId为字符串类型'),
  body('lightId')
    .notEmpty()
    .withMessage('lightId不能为空')
    .isString()
    .withMessage('lightId为字符串类型'),
]);
