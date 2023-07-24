const { body } = require('express-validator');
const validate = require('../middleware/validate');

exports.create = validate([
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

exports.update = validate([
  body('lightId').notEmpty().withMessage('lightId不能为空'),
]);
