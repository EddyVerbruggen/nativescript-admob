var utils = require("tns-core-modules/utils/utils");
var application = require("tns-core-modules/application");
var frame = require("tns-core-modules/ui/frame");
var admob = require("./admob-common");

admob._getBannerType = function (size) {
  if (size == admob.AD_SIZE.BANNER) {
    return com.google.android.gms.ads.AdSize.BANNER;
  } else if (size == admob.AD_SIZE.LARGE_BANNER) {
    return com.google.android.gms.ads.AdSize.LARGE_BANNER;
  } else if (size == admob.AD_SIZE.MEDIUM_RECTANGLE) {
    return com.google.android.gms.ads.AdSize.MEDIUM_RECTANGLE;
  } else if (size == admob.AD_SIZE.FULL_BANNER) {
    return com.google.android.gms.ads.AdSize.FULL_BANNER;
  } else if (size == admob.AD_SIZE.FLUID) {
    return com.google.android.gms.ads.AdSize.FLUID;
  } else if (size == admob.AD_SIZE.LEADERBOARD) {
    // doesn't seem to work on Android - using large instead
    //return com.google.android.gms.ads.AdSize.LEADERBOARD;
    return com.google.android.gms.ads.AdSize.LARGE_BANNER;
  } else if (size == admob.AD_SIZE.SKYSCRAPER) {
    return com.google.android.gms.ads.AdSize.WIDE_SKYSCRAPER;
  } else if (size == admob.AD_SIZE.SMART_BANNER) {
    return com.google.android.gms.ads.AdSize.SMART_BANNER;
  } else {
    return null;
  }
};

admob._md5 = function (input) {
  try {
    var digest = java.security.MessageDigest.getInstance("MD5");
    var bytes = [];
    for (var j = 0; j < input.length; ++j) {
      bytes.push(input.charCodeAt(j));
    }

    var s = new java.lang.String(input);
    digest.update(s.getBytes());
    var messageDigest = digest.digest();
    var hexString = "";
    for (var i = 0; i < messageDigest.length; i++) {
      var h = java.lang.Integer.toHexString(0xFF & messageDigest[i]);
      while (h.length < 2)
        h = "0" + h;
      hexString += h;
    }
    return hexString;

  } catch (noSuchAlgorithmException) {
    console.log("error generating md5: " + noSuchAlgorithmException);
    return null;
  }
};

// need to cache this baby since after an Interstitial was shown a second won't resolve the activity
admob.activity = null;
admob._getActivity = function () {
  if (admob.activity === null) {
    admob.activity = application.android.foregroundActivity;
  }
  return admob.activity;
};

admob._buildAdRequest = function (settings) {
  var builder = new com.google.android.gms.ads.AdRequest.Builder();
  if (settings.testing) {
    builder.addTestDevice(com.google.android.gms.ads.AdRequest.DEVICE_ID_EMULATOR);
    // This will request test ads on the emulator and device by passing this hashed device ID.
    var ANDROID_ID = android.provider.Settings.Secure.getString(admob._getActivity().getContentResolver(), android.provider.Settings.Secure.ANDROID_ID);
    var deviceId = admob._md5(ANDROID_ID);
    if (deviceId !== null) {
      deviceId = deviceId.toUpperCase();
      console.log("Treating this deviceId as testdevice: " + deviceId);
      builder.addTestDevice(deviceId);
    }
  }

  if (settings.keywords !== undefined && settings.keywords.length > 0) {
    for (var i = 0; i < settings.keywords.length; i++) {
      builder.addKeyword(settings.keywords[i]);
    }
  }

  var bundle = new android.os.Bundle();
  bundle.putInt("nativescript", 1);
  var adextras = new com.google.android.gms.ads.mediation.admob.AdMobExtras(bundle);
  //builder = builder.addNetworkExtras(adextras);
  return builder.build();
};

admob.createBanner = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      // always close a previous opened banner
      if (admob.adView !== null && admob.adView !== undefined) {
        var parent = admob.adView.getParent();
        if (parent !== null) {
          parent.removeView(admob.adView);
        }
      }
      var settings = admob.merge(arg, admob.defaults);
      admob.adView = new com.google.android.gms.ads.AdView(admob._getActivity());
      admob.adView.setAdUnitId(settings.androidBannerId);
      var bannerType = admob._getBannerType(settings.size);
      admob.adView.setAdSize(bannerType);
      // TODO consider implementing events, after v1
      //admob.adView.setAdListener(new com.google.android.gms.ads.BannerListener());

      var ad = admob._buildAdRequest(settings);
      admob.adView.loadAd(ad);

      var density = utils.layout.getDisplayDensity(),
          top = settings.margins.top * density,
          bottom = settings.margins.bottom * density;

      var relativeLayoutParams = new android.widget.RelativeLayout.LayoutParams(
          android.widget.RelativeLayout.LayoutParams.MATCH_PARENT,
          android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT);

      if (bottom > -1) {
        relativeLayoutParams.bottomMargin = bottom;
        relativeLayoutParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_BOTTOM);
      } else {
        if (top > -1) {
          relativeLayoutParams.topMargin = top;
        }
        relativeLayoutParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_TOP);
      }

      var adViewLayout = new android.widget.RelativeLayout(admob._getActivity());
      adViewLayout.addView(admob.adView, relativeLayoutParams);

      var relativeLayoutParamsOuter = new android.widget.RelativeLayout.LayoutParams(
          android.widget.RelativeLayout.LayoutParams.MATCH_PARENT,
          android.widget.RelativeLayout.LayoutParams.MATCH_PARENT);

      // Wrapping it in a timeout makes sure that when this function is loaded from a Page.loaded event 'frame.topmost()' doesn't resolve to 'undefined'.
      // Also, in NativeScript 4+ it may be undefined anyway.. so using the appModule in that case.
      setTimeout(function () {
        var topmost = frame.topmost();
        if (topmost !== undefined) {
          topmost.currentPage &&
          topmost.currentPage.android &&
          topmost.currentPage.android.getParent() &&
          topmost.currentPage.android.getParent().addView(adViewLayout, relativeLayoutParamsOuter);
        } else {
          application.android &&
          application.android.foregroundActivity &&
          application.android.foregroundActivity.getWindow() &&
          application.android.foregroundActivity.getWindow().getDecorView() &&
          application.android.foregroundActivity.getWindow().getDecorView().addView(adViewLayout, relativeLayoutParamsOuter);
        }
      }, 0);

      resolve();
    } catch (ex) {
      console.log("Error in admob.createBanner: " + ex);
      reject(ex);
    }
  });
};

admob.preloadInterstitial = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      var settings = admob.merge(arg, admob.defaults);
      admob.interstitialView = new com.google.android.gms.ads.InterstitialAd(admob._getActivity());
      admob.interstitialView.setAdUnitId(settings.androidInterstitialId);

      // Interstitial ads must be loaded before they can be shown, so adding a listener
      var InterstitialAdListener = com.google.android.gms.ads.AdListener.extend({
        onAdLoaded: function () {
          console.log("onAdLoaded");
          resolve();
        },
        onAdFailedToLoad: function (errorCode) {
          console.log("onAdFailedToLoad: " + errorCode);
          reject(errorCode);
        },
        onAdClosed: function () {
          if (admob.interstitialView) {
            admob.interstitialView.setAdListener(null);
            admob.interstitialView = null;
          }
          arg.onAdClosed && arg.onAdClosed();
        }
      });
      admob.interstitialView.setAdListener(new InterstitialAdListener());

      var ad = admob._buildAdRequest(settings);
      admob.interstitialView.loadAd(ad);
    } catch (ex) {
      console.log("Error in admob.preloadInterstitial: " + ex);
      reject(ex);
    }
  });
};

admob.showInterstitial = function () {
  return new Promise(function (resolve, reject) {
    try {
      if (admob.interstitialView) {
        admob.interstitialView.show();
        resolve();
      } else {
        reject("Please call 'preloadInterstitial' first.");
      }
    } catch (ex) {
      console.log("Error in admob.showInterstitial: " + ex);
      reject(ex);
    }
  });
};

admob.createInterstitial = function (arg) {
  return new Promise(function (resolve, reject) {
    admob.preloadInterstitial(arg)
        .then(function () {
          admob.showInterstitial().then(resolve);
        })
        .catch(reject);
  });
};

admob.hideBanner = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      if (admob.adView != null) {
        var parent = admob && admob.adView && admob.adView.getParent();
        if (parent != null) {
          parent.removeView(admob.adView);
        }
        admob.adView = null;
      }
      resolve();
    } catch (ex) {
      console.log("Error in admob.hideBanner: " + ex);
      reject(ex);
    }
  });
};

let rewardedVideoCallbacks = {
  onRewarded: () => {},
  onRewardedVideoAdLeftApplication: () => {},
  onRewardedVideoAdClosed: () => {},
  onRewardedVideoAdOpened: () => {},
  onRewardedVideoStarted: () => {},
  onRewardedVideoCompleted: () => {},
}
admob.preloadRewardedVideoAd = function (arg) {
   return new Promise(function (resolve, reject) {
     try {
       var settings = admob.merge(arg, admob.defaults);
       if(settings.testing) {
         settings.androidAddPlacementId = "ca-app-pub-3940256099942544/5224354917";
       }
       admob.videoView = com.google.android.gms.ads.MobileAds.getRewardedVideoAdInstance(admob._getActivity());

        // rewarded Ads ads must be loaded before they can be shown, so adding a listener
       var InterstitialAdListener = com.google.android.gms.ads.reward.RewardedVideoAdListener.extend({
         onRewarded(reward) {
           rewardedVideoCallbacks.onRewarded(reward);
         },
         onRewardedVideoAdLeftApplication() {
           rewardedVideoCallbacks.onRewardedVideoAdLeftApplication();
         },
         onRewardedVideoAdClosed() {
           if (admob.videoView) {
             admob.videoView.setRewardedVideoAdListener(null);
             admob.videoView = null;
           }
           rewardedVideoCallbacks.onRewardedVideoAdClosed();
         },
         onRewardedVideoAdFailedToLoad(errorCode) {
           reject(errorCode);
         },
         onRewardedVideoAdLoaded() {
           resolve();
         },
         onRewardedVideoAdOpened() {
           rewardedVideoCallbacks.onRewardedVideoAdOpened();
         },
         onRewardedVideoStarted() {
           rewardedVideoCallbacks.onRewardedVideoStarted();
         },
         onRewardedVideoCompleted() {
           rewardedVideoCallbacks.onRewardedVideoCompleted();
         }
       });
       admob.videoView.setRewardedVideoAdListener(new InterstitialAdListener());

       var ad = admob._buildAdRequest(settings);
       admob.videoView.loadAd(settings.androidAddPlacementId, ad);
     } catch (ex) {
       console.log("Error in admob.preloadVideoAd: " + ex);
       reject(ex);
     }
   });
 };

  admob.showRewardedVideoAd = function (arg) {
    if(arg.onRewarded) {
      rewardedVideoCallbacks.onRewarded = arg.onRewarded;
    }
    if(arg.onRewardedVideoAdLeftApplication) {
      rewardedVideoCallbacks.onRewardedVideoAdLeftApplication = arg.onRewardedVideoAdLeftApplication;
    }
    if(arg.onRewardedVideoAdClosed) {
      rewardedVideoCallbacks.onRewardedVideoAdClosed = arg.onRewardedVideoAdClosed;
    }
    if(arg.onRewardedVideoAdOpened) {
      rewardedVideoCallbacks.onRewardedVideoAdOpened = arg.onRewardedVideoAdOpened;
    }
    if(arg.onRewardedVideoStarted) {
      rewardedVideoCallbacks.onRewardedVideoStarted = arg.onRewardedVideoStarted;
    }
    if(arg.onRewardedVideoCompleted) {
      rewardedVideoCallbacks.onRewardedVideoCompleted = arg.onRewardedVideoCompleted;
    }
   return new Promise(function (resolve, reject) {
     try {
       if (admob.videoView) {
         admob.videoView.show();
         resolve();
       } else {
         reject("Please call 'preloadVideoAd' first.");
       }
     } catch (ex) {
       console.log("Error in admob.showVideoAd: " + ex);
       reject(ex);
     }
   });
 };
module.exports = admob;
