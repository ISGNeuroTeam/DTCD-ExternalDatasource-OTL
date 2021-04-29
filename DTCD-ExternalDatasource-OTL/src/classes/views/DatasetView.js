import { BaseDataset } from 'SDK/DatasourceClasses';

export class DatasetView extends BaseDataset {

  #jobDataset;
  #urls = [];
  #data = null;

  constructor (jobDataset = null) {
    super();
    this.#jobDataset = jobDataset;
    this.#jobDataset.urls().then(res => {
      this.#urls = res;
    });
  }

  async #checkData () {
    if (!this.#data) {
      this.#data = await this.#jobDataset.data();
    }
  }

  get schema () {
    return this.#jobDataset.parseSchema();
  }

  async full () {
    await this.#checkData();
    return this.#data;
  }

  async firstLine () {
    await this.#checkData();
    return this.#data[0];
  }

  async lastLine () {
    await this.#checkData();
    return this.#data[this.#data.length - 1];
  }

  async getLineByNumber (num) {
    await this.#checkData();
    return this.#data[num - 1];
  }

}
