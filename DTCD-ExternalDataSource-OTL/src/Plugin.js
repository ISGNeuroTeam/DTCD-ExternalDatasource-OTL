import { pluginMeta } from './../package.json';

import {
  InteractionSystemAdapter,
  LogSystemAdapter,
  InProgressError,
  BaseExternalDataSource,
} from 'SDK';
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
  #logSystem;
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
    this.#logSystem = new LogSystemAdapter('no-guid', 'ExternalDatasource-OTL');
    this.#interactionSystem = new InteractionSystemAdapter();
    this.#logSystem.debug(
      `Initing ExternalDatasource-OTL instance with parameters: ${JSON.stringify({
        original_otl,
        ...rest,
      })}`
    );
    this.#jobParams = { original_otl, ...rest };

    const { baseURL: url } = this.#interactionSystem.instance;
    this.#otpService = new OTPConnectorService(
      { url, ...connectorConfig },
      this.#interactionSystem.instance
    );
  }

  async init() {
    try {
      this.#logSystem.debug(
        `Creating OTL job instance with parameters: ${JSON.stringify(this.#jobParams)}`
      );
      this.#job = await this.#otpService.jobManager.createJob(this.#jobParams, { blocking: true });
      return true;
    } catch (error) {
      this.#logSystem.error(`Error occured while creating OTL job: ${JSON.stringify(error)}`);
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
    if (original_otl) {
      this.#logSystem.debug(
        `Editing parameters of OTL job. Merging new parameters: ${JSON.stringify({
          original_otl,
          ...rest,
        })} to existing: ${JSON.stringify(this.#jobParams)}`
      );

      this.#jobParams = Object.assign(this.#jobParams, { original_otl, ...rest });
    } else {
      this.#logSystem.debug(
        `Editing parameters of OTL job. Merging new parameters: ${JSON.stringify(
          rest
        )} to existing: ${JSON.stringify(this.#jobParams)}`
      );

      this.#jobParams = Object.assign(this.#jobParams, rest);
    }
  }
}
