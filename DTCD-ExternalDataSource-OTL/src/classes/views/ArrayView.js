export class ArrayView {

  #jobDataset;

  constructor (jobDataset = null) {
    this.#jobDataset = jobDataset;
  }

  async get () {
    const data = await this.#jobDataset.data();
    return Array.from(data);
  }

}
