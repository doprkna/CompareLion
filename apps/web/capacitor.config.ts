import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.parel.mvp',
  appName: 'PareL',
  webDir: 'out',
  bundledWebRuntime: false,
  
  // Server configuration for dev
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'parel.app',
    // For dev: uncomment and set to your dev server
    // url: 'http://localhost:3000',
    // cleartext: true,
  },

  // Android specific
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK',
    },
  },

  // iOS specific
  ios: {
    contentInset: 'automatic',
    scheme: 'PareL',
  },

  // Plugins
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0c0a1f',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#8b5cf6',
    },
    
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },

    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#8b5cf6',
    },

    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },

    StatusBar: {
      style: 'dark',
      backgroundColor: '#0c0a1f',
    },

    // AdMob plugin configuration (v0.36.22)
    AdMob: {
      appIdAndroid: process.env.ADMOB_ANDROID_APP_ID || '',
      appIdIOS: process.env.ADMOB_IOS_APP_ID || '',
      bannerAndroid: process.env.ADMOB_ANDROID_BANNER_ID || '',
      bannerIOS: process.env.ADMOB_IOS_BANNER_ID || '',
      rewardedAndroid: process.env.ADMOB_ANDROID_REWARDED_ID || '',
      rewardedIOS: process.env.ADMOB_IOS_REWARDED_ID || '',
      interstitialAndroid: process.env.ADMOB_ANDROID_INTERSTITIAL_ID || '',
      interstitialIOS: process.env.ADMOB_IOS_INTERSTITIAL_ID || '',
    },
  },
};

export default config;

