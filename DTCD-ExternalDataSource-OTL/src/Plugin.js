import { pluginMeta } from './../package.json';

import {
  InteractionSystemAdapter,
  StorageSystemAdapter,
  LogSystemAdapter,
  InProgressError,
  BaseExternalDataSource,
} from 'SDK';
import { OTPConnectorService } from '../../ot_js_connector';

const connectorConfig = {
  modeHTTP: 'http',
  maxJobExecTime: 300,
  checkjobDelayTime: 1,
  httpRequestTimeout: 70,
  loginBeforeJobRun: false,
};

export class DataSourcePlugin extends BaseExternalDataSource {
  #interactionSystem;
  #storageSystem;
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

  constructor({ queryString, ...rest }) {
    super();
    this.#logSystem = new LogSystemAdapter('0.5.0', 'no-guid', pluginMeta.name);
    this.#interactionSystem = new InteractionSystemAdapter('0.4.0');
    this.#storageSystem = new StorageSystemAdapter('0.9.0');

    const original_otl = queryString.replace(/\r|\n/g, '');

    this.#logSystem.debug(
      `Initing ExternalDatasource-OTL instance with parameters: ${JSON.stringify({
        original_otl,
        ...rest,
      })}`
    );
    this.#jobParams = { ...rest, original_otl };

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
      this.#jobParams.username = await this.#getCurrentUsername();
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

  async #getCurrentUsername() {
    const store = this.#storageSystem.session.system;

    if (store.hasRecord('_username')) {
      return store.getRecord('_username');
    }

    const { data: { username } } = await this.#interactionSystem.GETRequest('/dtcd_utils/v1/user?username');
    store.putRecord('_username', username);

    return username;
  }

  editParams({ queryString, ...rest }) {
    const original_otl = queryString.replace(/\r|\n/g, '');

    if (original_otl) {
      this.#logSystem.debug(
        `Editing parameters of OTL job. Merging new parameters: ${JSON.stringify({
          original_otl,
          ...rest,
        })} to existing: ${JSON.stringify(this.#jobParams)}`
      );

      this.#jobParams = Object.assign(this.#jobParams, { ...rest, original_otl });
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
