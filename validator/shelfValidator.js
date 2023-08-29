const { body } = require('express-validator');
const validate = require('../middleware/validate');

exports.save = validate([
  body('_id'),
  body('shelfId')
    .notEmpty()
    .withMessage('shelfId不能为空')
    .isString()
    .withMessage('shelfId为字符串类型'),
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
  body('topic')
    .notEmpty()
    .withMessage('topic不能为空')
    .isString()
    .withMessage('topic为字符串类型'),
]);

exports.getAll = validate([
  // body('pageNo')
  //   .notEmpty()
  //   .withMessage('pageNo不能为空')
  //   .isNumeric()
  //   .withMessage('shelfId为数字类型'),
  // body('pageSize')
  //   .notEmpty()
  //   .withMessage('pageSize不能为空')
  //   .isNumeric()
  //   .withMessage('pageSize为数字类型'),
]);

exports.update = validate([
  body('lightId').notEmpty().withMessage('lightId不能为空'),
]);

exports.openLight = validate([
  body('lightIds')
    .notEmpty()
    .withMessage('lightIds不能为空')
    .isArray()
    .withMessage('lightIds为数组')
    .custom((value) => {
      if (value && Array.isArray(value) && value.length > 0) {
        if (value.length !== new Set(value).size) {
          return false;
        }
      }
      return true;
    })
    .withMessage('存在重复light id'),
  body('lightIds.*').isString().withMessage('lightIds中的元素为字符串类型'),
  body('color')
    .notEmpty()
    .withMessage('color不能为空')
    .isString()
    .withMessage('color为字符类型'),
  body('duration')
    .notEmpty()
    .withMessage('duration不能为空')
    .isNumeric()
    .withMessage('duration为数字类型'),
]);

exports.blinkLight = validate([
  body('lightIds')
    .notEmpty()
    .withMessage('lightIds不能为空')
    .isArray()
    .withMessage('lightIds为数组')
    .custom((value) => {
      if (value && Array.isArray(value) && value.length > 0) {
        if (value.length !== new Set(value).size) {
          return false;
        }
      }
      return true;
    })
    .withMessage('存在重复light id'),
  body('lightIds.*').isString().withMessage('lightIds中的元素为字符串类型'),
  body('color')
    .notEmpty()
    .withMessage('color不能为空')
    .isString()
    .withMessage('color为字符类型'),
  body('duration')
    .notEmpty()
    .withMessage('duration不能为空')
    .isNumeric()
    .withMessage('duration为数字类型'),
]);

exports.closeLight = validate([
  body('lightIds')
    .notEmpty()
    .withMessage('lightIds不能为空')
    .isArray()
    .withMessage('lightIds为数组')
    .custom((value) => {
      if (value && Array.isArray(value) && value.length > 0) {
        if (value.length !== new Set(value).size) {
          return false;
        }
      }
      return true;
    })
    .withMessage('存在重复light id'),
  body('lightIds.*').isString().withMessage('lightIds中的元素为字符串类型'),
]);
