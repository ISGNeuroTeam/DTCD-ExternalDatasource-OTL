import pluginMeta from './Plugin.Meta';

import {
  InteractionSystemAdapter,
  LogSystemAdapter,
  BaseExternalDataSource,
  InProgressError,
} from 'SDK';
import {DataSourceContent} from './classes/DataSourceContent';
import {OTPConnectorService} from '../../ot_js_connector';

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
  #logSystem;
  #otpService;

  #job;
  #jobParams = {};

  static getExtensionInfo() {
    return {type: 'OTL'};
  }

  static getRegistrationMeta() {
    return pluginMeta;
  }

  constructor(guid, jobParams) {
    super();
    this.#jobParams = jobParams;
    this.#logSystem = new LogSystemAdapter(guid, pluginMeta.name);
    this.#interactionSystem = new InteractionSystemAdapter();

    const {baseURL: url} = this.#interactionSystem.instance;

    this.#otpService = new OTPConnectorService(
      {url, ...connectorConfig},
      this.#interactionSystem.instance
    );
  }

  async init() {
    const job = await this.#otpService.jobManager.createJob(this.#jobParams, {blocking: true});
    this.#job = job;
    const jobStatus = await job.status();
    if (jobStatus === 'success') return true;
    else if (jobStatus === 'running') throw new InProgressError();
    else throw new Error('Job not inited!');
  }

  async getRows(start, endParam, filterObject) {
    const data = await this.#job.dataset().data();
    const end = endParam === 0 ? data.length : endParam;
    let filtered;
    if (typeof filterObject !== 'object') filtered = data;
    else {
      filtered = data.filter(item => {
        for (let key of Object.keys(filterObject)) {
          if (!item[key].includes(filterObject[key])) return false;
        }
        return true;
      });
    }
    return new DataSourceContent(filtered.slice(start, end));
  }

  async getSchema() {
    return await this.#job.dataset().parseSchema();
  }

  async rerun() {
    if (!this.#job) return;
    await this.#job.run();
  }
}
