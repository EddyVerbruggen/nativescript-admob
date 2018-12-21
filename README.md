# NativeScript AdMob plugin

[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]
[![Twitter Follow][twitter-image]][twitter-url]

[npm-image]:http://img.shields.io/npm/v/nativescript-admob.svg
[npm-url]:https://npmjs.org/package/nativescript-admob
[downloads-image]:http://img.shields.io/npm/dm/nativescript-admob.svg
[twitter-image]:https://img.shields.io/twitter/follow/eddyverbruggen.svg?style=social&label=Follow%20me
[twitter-url]:https://twitter.com/eddyverbruggen

## Installation
From the command prompt go to your app's root folder and execute:
```
tns plugin add nativescript-admob
```

### Android
> ⚠️ Important! Plugin version 3.0.0+ requires you to do this - or your app will crash on start-up! ⚠️

Open your App_Resources/Android/AndroidManifest.xml file and add this `meta-data` line at [the right spot](https://github.com/EddyVerbruggen/nativescript-admob/blob/6bfa83c303023d0e8072148dcb45b8befb9cd0aa/demo/app/App_Resources/Android/src/main/AndroidManifest.xml#L28) (and replace the value by the actual App ID of [your app](https://apps.admob.com/)!):

```xml
<application>
  <!-- this line needs to be added (replace the value!) -->
  <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="ca-app-pub-3940256099942544~3347511713" />

  <activity></activity>
</application>
```

### iOS
Run `pod repo update` from a Terminal, otherwise the required Pod version may not be available on your system.

## BANNER

If you want a quickstart, [clone our demo app](https://github.com/EddyVerbruggen/nativescript-admob-demo).

Here are the supported functions:

### createBanner

#### TypeScript

```typescript
import { AD_SIZE, createBanner, hideBanner } from "nativescript-admob";
import { isIOS } from "tns-core-modules/platform";

const testing = true;
createBanner({
  // if this 'view' property is not set, the banner is overlayed on the current top most view
  // view: ..,
  size: AD_SIZE.SMART_BANNER,
  iosBannerId: "ca-app-pub-9517346003011652/3985369721",
  androidBannerId: testing
      ? "ca-app-pub-3940256099942544/6300978111"  // global test banner id
      : "ca-app-pub-9517346003011652/7749101329", // our registered banner id
  // Android automatically adds the connected device as test device with testing:true, iOS does not
  // iosTestDeviceIds: ["yourTestDeviceUDIDs", "canBeAddedHere"],
  margins: {
    // if both are set, top wins
    // top: 10
    bottom: isIOS ? 50 : 0
  },
  keywords: ["foo", "bar"]
}).then(
    () => this.message = "Banner created",
    error => this.message = "Error creating banner: " + error
)
```

#### JavaScript
```js
var admob = require("nativescript-admob");

admob.createBanner({
    // if this 'view' property is not set, the banner is overlayed on the current top most view
    // view: ..,
    testing: true, // set to false to get real banners
    size: size, // anything in admob.AD_SIZE, like admob.AD_SIZE.SMART_BANNER
    iosBannerId: "ca-app-pub-XXXXXX/YYYYYY", // add your own
    androidBannerId: "ca-app-pub-AAAAAAAA/BBBBBBB", // add your own
    // Android automatically adds the connected device as test device with testing:true, iOS does not
    iosTestDeviceIds: ["yourTestDeviceUDIDs", "canBeAddedHere"],
    margins: {
      // if both are set, top wins
      //top: 10
      bottom: 50
    },
    keywords: ["keyword1", "keyword2"] // add keywords for ad targeting
  }).then(
      function() {
        console.log("admob createBanner done");
      },
      function(error) {
        console.log("admob createBanner error: " + error);
      }
)
```

Note that you can trigger the function above at any moment, and since version 1.1.4
of this plugin you can even call it [from the `Page.loaded` event](https://github.com/EddyVerbruggen/nativescript-admob-demo/blob/master/AdMob/app/main-page.js#L9).

### hideBanner
NOTE: If you want to show a different banner than the one showing you don't need to call `hideBanner`
since `createBanner` will do that for you to prevent your app from crashing.

```js
// the .then(.. bit is optional btw
admob.hideBanner().then(
      function() {
        console.log("admob hideBanner done");
      },
      function(error) {
        console.log("admob hideBanner error: " + error);
      }
)
```

## INTERSTITIAL
To show a fullscreen ad, you can use this function. Note that Interstitial banners need to be loaded before
they can be shown, and there are two ways to do that:

* Use `createInterstitial` and have the plugin automatically preload the ad and show it when loaded. This is not recommended because there's a delay the user may notice.
* (Since plugin version 2.0.0) Use `preloadInterstitial`, and (at any time after its Promise resolves) `showInterstitial`. This will hide the preloading delay for your users. Note that the parameters of `createInterstitial` and `preloadInterstitial` are exactly the same so migration should be easy. 

If you want to get notified when an interstitial is closed, provide an `onAdClosed` callback as shown below.

### createInterstitial
Again, not recommended.

```js
admob.createInterstitial({
    testing: true,
    iosInterstitialId: "ca-app-pub-XXXXXX/YYYYY2", // add your own
    androidInterstitialId: "ca-app-pub-AAAAAAAA/BBBBBB2", // add your own
    // Android automatically adds the connected device as test device with testing:true, iOS does not
    iosTestDeviceIds: ["ce97330130c9047ce0d4430d37d713b2"],
    keywords: ["keyword1", "keyword2"], // add keywords for ad targeting
    onAdClosed: function () { console.log("interstitial closed") }
  }).then(
      function() {
        console.log("admob createInterstitial done");
      },
      function(error) {
        console.log("admob createInterstitial error: " + error);
      }
)
```

### preloadInterstitial
Use this for instance while loading your view, so it's ready for the moment you want to actually show it (by calling `showInterstitial`).

Note that the parameters are identical to `createInterstitial`.

```js
admob.preloadInterstitial({
    testing: true,
    iosInterstitialId: "ca-app-pub-XXXXXX/YYYYY2", // add your own
    androidInterstitialId: "ca-app-pub-AAAAAAAA/BBBBBB2", // add your own
    // Android automatically adds the connected device as test device with testing:true, iOS does not
    iosTestDeviceIds: ["ce97330130c9047ce0d4430d37d713b2"],
    keywords: ["keyword1", "keyword2"], // add keywords for ad targeting
    onAdClosed: function () { console.log("interstitial closed") }
  }).then(
      function() {
        console.log("interstitial preloaded - you can now call 'showInterstitial' whenever you're ready to do so");
      },
      function(error) {
        console.log("admob preloadInterstitial error: " + error);
      }
)
```

### showInterstitial
At any moment after `preloadInterstitial` successfully resolves, you can call `showInterstitial`.

Note that when you want to use `showInterstitial` again, you also have to use `preloadInterstitial` again because those ads can't be reused. 

```js
admob.showInterstitial().then(
      function() {
        // this will resolve almost immediately, and the interstitial is shown without a delay because it was already loaded
        console.log("interstitial showing");
      },
      function(error) {
        console.log("admob showInterstitial error: " + error);
      }
)
```


### preloadRewardedVideoAd
Use this for instance while loading your view, so it's ready for the moment you want to actually show it (by calling `showRewardedVideoAd`).

```js
admob.preloadRewardedVideoAd({
    testing: true,
    iosAdPlacementId: "ca-app-pub-XXXXXX/YYYYY2", // add your own
    androidAdPlacementId: "ca-app-pub-AAAAAAAA/BBBBBB2", // add your own
    keywords: ["keyword1", "keyword2"], // add keywords for ad targeting
  }).then(
      function() {
        console.log("RewardedVideoAd preloaded - you can now call 'showRewardedVideoAd' whenever you're ready to do so");
      },
      function(error) {
        console.log("admob preloadRewardedVideoAd error: " + error);
      }
)
```

### showRewardedVideoAd
At any moment after `preloadRewardedVideoAd` successfully resolves, you can call `showRewardedVideoAd`.

Note that when you want to use `showRewardedVideoAd` again, you also have to use `preloadRewardedVideoAd` again because those ads can't be reused.

onRewarded is probably the only callback you need to worry about.

```js
admob.showRewardedVideoAd({
  onRewarded: (reward) => {
    console.log("onRewarded");
    this.message = "watched rewarded video";
  },
  onRewardedVideoAdLeftApplication: () => console.log("onRewardedVideoAdLeftApplication"),
  onRewardedVideoAdClosed: () => console.log("onRewardedVideoAdClosed"),
  onRewardedVideoAdOpened: () => console.log("onRewardedVideoAdOpened"),
  onRewardedVideoStarted: () => console.log("onRewardedVideoStarted"),
  onRewardedVideoCompleted: () => console.log("onRewardedVideoCompleted"),
}).then(
      function() {
        console.log("RewardedVideoAd showing");
      },
      function(error) {
        console.log("admob showRewardedVideoAd error: " + error);
      }
)
```

## Tutorials
Need a little more help getting started? Check out these tutorials for using Admob in a NativeScript Android and iOS application.

* [Monetize with Google Admob in a NativeScript Vanilla Application](https://www.thepolyglotdeveloper.com/2016/03/monetize-with-google-admob-in-a-nativescript-mobile-app/)
* [Monetize with Google Admob in a NativeScript Angular Application](https://www.thepolyglotdeveloper.com/2016/11/google-admob-nativescript-angular-2/)
