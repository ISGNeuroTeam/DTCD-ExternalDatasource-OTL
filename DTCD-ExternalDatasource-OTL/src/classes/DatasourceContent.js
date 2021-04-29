import { BaseDatasourceContent } from 'SDK/DatasourceClasses';
import { DatasetView } from './views/DatasetView';
import { ArrayView } from './views/ArrayView';
import { JsonView } from './views/JsonView';

export class DatasourceContent extends BaseDatasourceContent {

  #data;

  constructor (jobDataset) {
    super();
    this.#data = jobDataset;
  }

  toDataset () {
    return new DatasetView(this.#data);
  }

  toArray () {
    return new ArrayView(this.#data);
  }

  toJSON () {
    return new JsonView(this.#data);
  }

  toString () {
    throw new Error('OTL-datasource cannot be cast to string');
  }

  toNumber () {
    throw new Error('OTL-datasource cannot be cast to number');
  }

}
