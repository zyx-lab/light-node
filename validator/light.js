const { body } = require('express-validator');
const validate = require('../middleware/validate');

exports.inStock = validate([
  body('taskId')
    .notEmpty()
    .withMessage('taskId不能为空')
    .isString()
    .withMessage('taskId为字符串类型'),
  body('duration').notEmpty().withMessage('duration不能为空'),
  body('locationIds')
    .isArray()
    .notEmpty()
    .withMessage('locationIds不能为空')
    .custom((value) => {
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('locationIds长度要大于0');
      }

      const uniqueValues = new Set(value);
      if (uniqueValues.size !== value.length) {
        throw new Error('locationIds中不能有重复值');
      }
      return true;
    }),
  body('locationIds.*')
    .isString()
    .withMessage('locationIds中的元素为字符串类型'),
]);
