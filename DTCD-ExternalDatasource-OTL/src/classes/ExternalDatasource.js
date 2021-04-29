import { OTPConnectorService } from '../../../ot_js_connector';
import { InteractionSystemAdapter } from 'SDK';
import { BaseExternalDatasource } from 'SDK/DatasourceClasses';
import { DatasourceContent } from './DatasourceContent';

const connectorConfig = {
  modeHTTP: 'http',
  username: 'admin',
  password: '12345678',
  maxJobExecTime: 300,
  checkjobDelayTime: 1,
  httpRequestTimeout: 70,
};

export class ExternalDatasource extends BaseExternalDatasource {

  #interactionSystem;
  #logger;
  #otpService;

  #job;
  #jobParams = {};
  #content = null;
  #isInited = false;
  #status = 'inProgress';

  constructor (logSystemAdapter) {
    super();
    this.#logger = logSystemAdapter;
    this.#interactionSystem = new InteractionSystemAdapter();

    const { baseURL: url } = this.#interactionSystem.instance;

    this.#otpService = new OTPConnectorService(
      { url, ...connectorConfig },
      this.#interactionSystem.instance
    );
  }

  async init (jobParams = {}, isRun = false) {
    this.#jobParams = jobParams;
    this.#isInited = true;
    isRun && await this.run();
  }

  async run () {
    if (!this.#isInited) {
      throw new Error(`Datasource must be inited before run`);
    }

    await this.#otpService.jobManager.createJob(
      this.#jobParams,
      { blocking: true },
    ).then(async job => {
      this.#job = job;
      this.#content = new DatasourceContent(job.dataset());
      job.status().then(status => {
        if (status === 'success') {
          this.#status = 'complete';
        }
      });
    }).catch(err => {
      this.#status = 'error';
      throw new Error(err.message);
    });
  }

  async rerun () {
    if (!this.#job) return;
    await this.#job.run();
    this.#status = 'inProgress';
  }

  get content () {
    return this.#content;
  }

  get status () {
    return this.#status;
  }

}
