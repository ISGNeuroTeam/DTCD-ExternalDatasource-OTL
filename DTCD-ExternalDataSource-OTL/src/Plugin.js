import { pluginMeta } from './../package.json';

import { InteractionSystemAdapter, InProgressError, BaseExternalDataSource } from 'SDK';
import { OTPConnectorService } from '../../ot_js_connector';

const connectorConfig = {
  modeHTTP: 'http',
  username: 'admin',
  password: '12345678',
  maxJobExecTime: 300,
  checkjobDelayTime: 1,
  httpRequestTimeout: 70,
};

export class DataSourcePlugin extends BaseExternalDataSource {
  #interactionSystem;
  #otpService;

  #job;
  #jobParams = {};

  static getExtensionInfo() {
    return { type: 'OTL' };
  }

  static getRegistrationMeta() {
    return pluginMeta;
  }

  constructor(jobParams) {
    super();
    this.data = [];
    this.#jobParams = jobParams;
    this.#interactionSystem = new InteractionSystemAdapter();
    const { baseURL: url } = this.#interactionSystem.instance;
    this.#otpService = new OTPConnectorService(
      { url, ...connectorConfig },
      this.#interactionSystem.instance
    );
  }

  async init() {
    this.#job = await this.#otpService.jobManager.createJob(this.#jobParams, { blocking: true });
    const jobStatus = await this.#job.status();
    if (jobStatus === 'success') {
      this.data = await this.#job.dataset().data();
      return true;
    } else if (jobStatus === 'running') {
      throw new InProgressError('');
    } else throw new Error('Job not inited!');
  }

  [Symbol.iterator]() {
    return {
      currentIndex: 0,
      iterable: this,
      next() {
        if (this.currentIndex >= this.iterable.data.length) {
          return { done: true };
        } else {
          const value = this.iterable.data[this.currentIndex];
          this.currentIndex += 1;
          return { value, done: false };
        }
      },
    };
  }

  async getSchema() {
    return await this.#job.dataset().parseSchema();
  }

  async rerun() {
    if (!this.#job) return;
    await this.#job.run();
  }

  toString() {
    return `OTL DataSource inited`;
  }
}
