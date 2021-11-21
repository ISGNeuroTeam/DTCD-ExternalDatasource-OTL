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
    this.#jobParams = jobParams;
    this.#interactionSystem = new InteractionSystemAdapter();
    const { baseURL: url } = this.#interactionSystem.instance;
    this.#otpService = new OTPConnectorService(
      { url, ...connectorConfig },
      this.#interactionSystem.instance
    );
  }

  async init() {
    try {
      this.#job = await this.#otpService.jobManager.createJob(this.#jobParams, { blocking: true });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async getSchema() {
    return await this.#job.dataset().parseSchema();
  }

  async getData() {
    return await this.#job.dataset().data();
  }

  async rerun() {
    if (!this.#job) return;
    await this.#job.run();
  }

  editParams(jobParams) {
    this.#jobParams = jobParams;
  }

  toString() {
    return `OTL DataSource inited`;
  }
}
