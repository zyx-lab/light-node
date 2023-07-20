const Config = require('../models/configModel');

class ConfigSingleton {
  constructor() {
    this.config = null;
  }

  static async getInstance() {
    if (!ConfigSingleton.instance) {
      ConfigSingleton.instance = new ConfigSingleton();
      await ConfigSingleton.instance.loadConfig();
    }
    return ConfigSingleton.instance;
  }

  async loadConfig() {
    this.config = (await Config.findOne()) || {};
  }

  async saveConfig() {
    if (this.config) {
      const res = await Config.updateOne(
        {},
        {
          mode: this.config.mode,
          inColor: this.config.inColor,
          outColor: this.config.outColor,
          checkColor: this.config.checkColor,
        },
        { upsert: true, new: true }
      );
      return res;
    }
  }

  setMode(mode) {
    if (this.config) {
      this.config.mode = mode;
    }
  }

  getMode() {
    if (this.config) {
      return this.config.mode;
    }
    return null;
  }

  setInColor(value) {
    if (this.config) {
      this.config.inColor = value;
    }
  }

  getInColor() {
    if (this.config) {
      return this.config.inColor;
    }
    return null;
  }

  setOutColor(value) {
    if (this.config) {
      this.config.outColor = value;
    }
  }

  getOutColor() {
    if (this.config) {
      return this.config.outColor;
    }
    return null;
  }

  setCheckColor(value) {
    if (this.config) {
      this.config.checkColor = value;
    }
  }

  getCheckColor() {
    if (this.config) {
      return this.config.checkColor;
    }
    return null;
  }
}

module.exports = ConfigSingleton;
