const catchAsync = require('../utils/catchAsync');
const configService = require('../services/configService');

exports.save = catchAsync(async (req, res, next) => {
  const { mode, inColor, outColor, checkColor } = req.body;

  const configInstance = configService.getConfigInstance();
  configInstance.setMode(mode);
  configInstance.setInColor(inColor);
  configInstance.setOutColor(outColor);
  configInstance.setCheckColor(checkColor);

  await configInstance.saveConfig();
  res.status(200).json({
    status: 'success',
  });
});
