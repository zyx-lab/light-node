const axios = require('axios');
const { merge } = require('lodash');

class VeryAxios {
  constructor(options = {}, axiosConfig = {}) {
    const {
      // whether to cancel a duplicated request
      cancelDuplicated = false,
      // how to generate the duplicated key
      duplicatedKeyFn,
    } = options;

    // stores the identity and cancellation function for each request
    this.pendingAjax = new Map();
    this.cancelDuplicated = cancelDuplicated;
    this.duplicatedKeyFn =
      typeof duplicatedKeyFn === 'function'
        ? duplicatedKeyFn
        : (config) => `${config.method}${config.url}`;

    // default axios config
    this.defaultAxiosConfig = {
      timeout: 20000,
      responseType: 'json',
      headers: {
        'content-type': 'application/json',
      },
    };
    this.config = merge(this.defaultAxiosConfig, axiosConfig);

    this.createAxios();
    this.interceptors();
  }

  createAxios() {
    this.axios = axios.create(this.config);
  }

  interceptors() {
    // intercept response
    this.axios.interceptors.request.use((config) => {
      // check the previous request for cancellation before the request starts
      this.removePendingAjax(config);
      // add the current request to pendingAjax
      this.addPendingAjax(config);
      return config;
    });

    // intercept response
    this.axios.interceptors.response.use(
      // success handler
      // Any status code that lie within the range of 2xx cause this function to trigger
      (res) => {
        this.removePendingAjax(res.config);
        // console.log('interceptors response success');
        return Promise.resolve(res);
      },
      (err) => {
        const config = err.config || {};
        // console.log('interceptors response error', err);
        // when erroe is requested, remove the request
        this.removePendingAjax(config);
        return Promise.reject();
      }
    );
  }

  /**
   * add request to pendingAjax
   * @param {Object} config
   */
  addPendingAjax(config) {
    // if need cancel duplicated request
    if (!this.cancelDuplicated) return;
    const veryConfig = config.veryConfig || {};
    // console.log('addPendingAjax', veryConfig);
    const duplicatedKey = JSON.stringify({
      duplicatedKey: veryConfig.duplicatedKey || this.duplicatedKeyFn(config),
    });
    // console.log('addPendingAjax', duplicatedKey);
    config.cancelToken =
      config.cancelToken ||
      new axios.CancelToken((cancel) => {
        // if the current request does not exist in pendingAjax, add it
        if (duplicatedKey && !this.pendingAjax.has(duplicatedKey)) {
          this.pendingAjax.set(duplicatedKey, cancel);
        }
      });
  }

  /**
   * remove the request in pendingAjax
   * @param {Object} config
   */
  removePendingAjax(config) {
    // if need cancel duplicated request
    if (!this.cancelDuplicated) return;
    const veryConfig = config.veryConfig || {};
    const duplicatedKey = JSON.stringify({
      duplicatedKey: veryConfig.duplicatedKey || this.duplicatedKeyFn(config),
    });
    // if the current request exists in pendingAjax, cancel the current request and remove it
    if (duplicatedKey && this.pendingAjax.has(duplicatedKey)) {
      const cancel = this.pendingAjax.get(duplicatedKey);
      cancel(duplicatedKey);
      this.pendingAjax.delete(duplicatedKey);
    }
  }

  /**
   *
   * @param {String} type   [request type]
   * @param {String} path   [request url path]
   * @param {Object} param  [request params]
   */
  fetch(type, path, param = {}, config = {}) {
    return new Promise((resolve, reject) => {
      this.axios[type](path, param, config)
        .then((response) => {
          resolve(response);
        })
        .catch((err) => reject(err));
    });
  }

  /**
   *
   * @param {String} path   [request url path]
   * @param {Object} param  [request params]
   * @param {Object} config  [axios and very-axios config]
   */
  POST(path, param = {}, config = {}) {
    return this.fetch('post', path, param, config);
  }
}
module.exports = VeryAxios;
