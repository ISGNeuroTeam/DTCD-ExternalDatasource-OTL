import {BaseDataset} from 'SDK';

export class DatasetView extends BaseDataset {
  #data = null;

  constructor(data = null) {
    super();
    this.#data = data;
  }

  full() {
    return this.#data;
  }

  firstLine() {
    return this.#data[0];
  }

  lastLine() {
    return this.#data[this.#data.length - 1];
  }

  getLineByNumber(num) {
    return this.#data[num - 1];
  }
}
