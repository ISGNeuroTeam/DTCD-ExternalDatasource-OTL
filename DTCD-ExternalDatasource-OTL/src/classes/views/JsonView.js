export class JsonView {

  #jobDataset;

  constructor (jobDataset = null) {
    this.#jobDataset = jobDataset;
  }

  async get () {
    const data = await this.#jobDataset.data();
    return JSON.stringify(data);
  }

}
