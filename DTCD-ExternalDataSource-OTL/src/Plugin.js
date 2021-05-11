import pluginMeta from './Plugin.Meta';

import {BaseExternalDataSource, BaseDataset, InteractionSystemAdapter, LogSystemAdapter} from 'SDK';
import {OTPConnectorService} from '../../ot_js_connector';

import {InProgressError} from './classes/InProgressError';

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
  #status;

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
    const jobStatus = await job.status();
    this.#job = job;
    this.#status = jobStatus === 'success' ? 'complete' : 'error';
    return true;
  }

  async toDataset() {
    if (this.#status === 'complete') {
      return await this.#job.dataset().data();
    } else if (this.#status === 'inProgress') {
      throw new InProgressError('Error: Job with "inProgress" status');
    } else {
      throw new Error('Error of job!');
    }
  }

  async rerun() {
    if (!this.#job) return;
    await this.#job.run();
    this.#status = 'inProgress';
  }

  get status() {
    return this.#status;
  }
}
