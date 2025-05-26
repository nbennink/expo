import {
  createRunOncePlugin,
  AndroidConfig,
  withInfoPlist,
  withAndroidManifest,
} from 'expo/config-plugins';

import { PluginConfigType, validateConfig } from './pluginConfig';

const pkg = require('expo-dev-launcher/package.json');

export default createRunOncePlugin<PluginConfigType>(
  (config, props = {}) => {
    validateConfig(props);

    const iOSLaunchMode =
      props.ios?.launchMode ??
      props.launchMode ??
      props.ios?.launchModeExperimental ??
      props.launchModeExperimental;

    const devClientLaunchLastBundleIos = iOSLaunchMode === 'most-recent';
    const devClientLaunchLocalBundleIos = iOSLaunchMode === 'local';

    // TODO: apply changes in iOS
    config = withInfoPlist(config, (config) => {
      config.modResults['DEV_CLIENT_TRY_TO_LAUNCH_LAST_BUNDLE'] = devClientLaunchLastBundleIos;
      config.modResults['DEV_CLIENT_TRY_TO_LAUNCH_LOCAL_BUNDLE'] = devClientLaunchLocalBundleIos;

      return config;
    });

    const androidLaunchMode =
      props.android?.launchMode ??
      props.launchMode ??
      props.android?.launchModeExperimental ??
      props.launchModeExperimental;

    const devClientLaunchLastBundleAndroid = androidLaunchMode === 'most-recent';
    const devClientLaunchLocalBundleAndroid = androidLaunchMode === 'local';

    config = withAndroidManifest(config, (config) => {
      const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);

      AndroidConfig.Manifest.addMetaDataItemToMainApplication(
        mainApplication,
        'DEV_CLIENT_TRY_TO_LAUNCH_LAST_BUNDLE',
        devClientLaunchLastBundleAndroid.toString()
      );

      AndroidConfig.Manifest.addMetaDataItemToMainApplication(
        mainApplication,
        'DEV_CLIENT_TRY_TO_LAUNCH_LOCAL_BUNDLE',
        devClientLaunchLocalBundleAndroid.toString()
      );
      return config;
    });

    return config;
  },
  pkg.name,
  pkg.version
);
