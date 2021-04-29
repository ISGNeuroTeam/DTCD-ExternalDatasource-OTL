import { ExtensionPlugin, LogSystemAdapter } from 'SDK';
import { ExternalDatasource } from './classes/ExternalDatasource';
import pluginMeta from './Plugin.Meta';

export class DatasourcePlugin extends ExtensionPlugin {

  constructor (guid) {
    super();
    this.ds = new ExternalDatasource(
      new LogSystemAdapter(guid, pluginMeta.name),
    );
  }

  static getExtensionInfo () {
    return { type: 'OTL' };
  }

  static getRegistrationMeta () {
    return pluginMeta;
  }

}
