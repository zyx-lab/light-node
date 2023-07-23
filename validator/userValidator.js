const { body } = require('express-validator');
const validate = require('../middleware/validate');

exports.createUser = validate([
  body('userId')
    .notEmpty()
    .withMessage('userId不能为空')
    .isString()
    .withMessage('userId为字符串类型'),
]);
