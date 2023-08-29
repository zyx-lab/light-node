const { body } = require('express-validator');
const validate = require('../middleware/validate');

exports.save = validate([
  body('_id'),
  body('locationId')
    .notEmpty()
    .withMessage('locationId不能为空')
    .isString()
    .withMessage('locationId为字符串类型'),
  body('shelf')
    .notEmpty()
    .withMessage('shelf不能为空')
    .isString()
    .withMessage('shelf为字符串类型'),
  body('lightId')
    .notEmpty()
    .withMessage('lightId不能为空')
    .isString()
    .withMessage('lightId为字符串类型'),
  body('topic')
    .notEmpty()
    .withMessage('topic不能为空')
    .isString()
    .withMessage('topic为字符串类型'),
]);
