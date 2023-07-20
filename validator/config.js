const { body } = require('express-validator');
const validate = require('../middleware/validate');

exports.save = validate([
  body('mode')
    .notEmpty()
    .withMessage('mode不能为空')
    .isString()
    .withMessage('mode为字符串类型'),
  body('inColor')
    .notEmpty()
    .withMessage('inColor不能为空')
    .isString()
    .withMessage('inColor为字符串类型'),
  body('outColor')
    .notEmpty()
    .withMessage('outColor不能为空')
    .isString()
    .withMessage('outColor为字符串类型'),
  body('checkColor')
    .notEmpty()
    .withMessage('checkColor不能为空')
    .isString()
    .withMessage('checkColor为字符串类型'),
]);
