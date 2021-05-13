import {BaseDataSourceContent} from 'SDK';
import {DatasetView} from './views/DatasetView';

export class DataSourceContent extends BaseDataSourceContent {
  #data;

  constructor(data) {
    super();
    this.#data = data;
  }

  toDataset() {
    return new DatasetView(this.#data);
  }

  toArray() {
    return Array.from(this.#data);
  }

  toJSON() {
    return JSON.stringify(this.#data);
  }

  toString() {
    return `Datas with ${this.#data.length} records`;
  }

  toNumber() {
    return this.#data.length;
  }

  get length() {
    return this.#data.length;
  }
}
