import {ExtensionPlugin, LogSystemAdapter} from 'SDK';
import {ExternalDataSource} from './classes/ExternalDataSource';
import pluginMeta from './Plugin.Meta';

export class DataSourcePlugin extends ExtensionPlugin {
  constructor(guid) {
    super();
    this.ds = new ExternalDataSource(new LogSystemAdapter(guid, pluginMeta.name));
  }

  static getExtensionInfo() {
    return {type: 'OTL'};
  }

  static getRegistrationMeta() {
    return pluginMeta;
  }
}
