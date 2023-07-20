const ConfigSingleton = require('../singletons/configSingleton');

class ConfigService {
  constructor() {
    this.configInstance = null;
  }

  async init() {
    this.configInstance = await ConfigSingleton.getInstance();
  }

  getConfigInstance() {
    return this.configInstance;
  }
}

module.exports = new ConfigService();
