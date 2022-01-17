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
  loginBeforeJobRun: false,
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

  constructor({ queryString: original_otl, ...rest }) {
    super();
    this.#jobParams = { original_otl, ...rest };
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

  editParams({ queryString: original_otl, ...rest }) {
    if (original_otl) this.#jobParams = Object.assign(this.#jobParams, { original_otl, ...rest });
    else this.#jobParams = Object.assign(this.#jobParams, rest);
  }

  toString() {
    return `OTL DataSource inited`;
  }
}
