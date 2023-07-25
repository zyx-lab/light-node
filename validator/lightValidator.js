const { body } = require('express-validator');
const validate = require('../middleware/validate');

exports.inStock = validate([
  body('taskId')
    .notEmpty()
    .withMessage('taskId不能为空')
    .isString()
    .withMessage('taskId为字符串类型'),
  body('userId')
    .notEmpty()
    .withMessage('userId不能为空')
    .isString()
    .withMessage('userId为字符串类型'),
  body('duration').notEmpty().withMessage('duration不能为空'),
  body('locationIds')
    .notEmpty()
    .withMessage('locationIds不能为空')
    .isArray()
    .withMessage('locationIds为数组')
    .custom((value) => {
      if (value && Array.isArray(value) && value.length > 0) {
        if (value.length !== new Set(value).size) {
          return false;
        }
      }
      return true;
    })
    .withMessage('存在重复location id'),
  body('locationIds.*')
    .isString()
    .withMessage('locationIds中的元素为字符串类型'),
]);

exports.outStock = validate([
  body('taskId')
    .notEmpty()
    .withMessage('taskId不能为空')
    .isString()
    .withMessage('taskId为字符串类型'),
  body('userId')
    .notEmpty()
    .withMessage('userId不能为空')
    .isString()
    .withMessage('userId为字符串类型'),
  body('duration').notEmpty().withMessage('duration不能为空'),
  body('locationIds')
    .isArray()
    .notEmpty()
    .withMessage('locationIds不能为空')
    .custom((value) => {
      if (value && Array.isArray(value) && value.length > 0) {
        if (value.length !== new Set(value).size) {
          return false;
        }
      }
      return true;
    })
    .withMessage('存在重复location id'),
  body('locationIds.*')
    .isString()
    .withMessage('locationIds中的元素为字符串类型'),
]);

exports.checkStock = validate([
  body('taskId')
    .notEmpty()
    .withMessage('taskId不能为空')
    .isString()
    .withMessage('taskId为字符串类型'),
  body('userId')
    .notEmpty()
    .withMessage('userId不能为空')
    .isString()
    .withMessage('userId为字符串类型'),
  body('duration').notEmpty().withMessage('duration不能为空'),
  body('locationIds')
    .isArray()
    .notEmpty()
    .withMessage('locationIds不能为空')
    .custom((value) => {
      if (value && Array.isArray(value) && value.length > 0) {
        if (value.length !== new Set(value).size) {
          return false;
        }
      }
      return true;
    })
    .withMessage('存在重复location id'),
  body('locationIds.*')
    .isString()
    .withMessage('locationIds中的元素为字符串类型'),
]);

exports.process = validate([
  body('locationId')
    .notEmpty()
    .withMessage('locationId不能为空')
    .isString()
    .withMessage('locationId为字符串类型'),
]);

exports.close = validate([
  body('lightId')
    .notEmpty()
    .withMessage('lightId不能为空')
    .isString()
    .withMessage('lightId为字符串类型'),
]);