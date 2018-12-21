var admob = require("./admob-common");
var application = require("tns-core-modules/application");
var utils = require("tns-core-modules/utils/utils");
var device = require("tns-core-modules/platform").device;
var DeviceType = require("tns-core-modules/ui/enums").DeviceType;

var GADBannerViewDelegateImpl = (function (_super) {
  __extends(GADBannerViewDelegateImpl, _super);

  function GADBannerViewDelegateImpl() {
    _super.apply(this, arguments);
  }

  GADBannerViewDelegateImpl.new = function () {
    return _super.new.call(this);
  };
  GADBannerViewDelegateImpl.prototype.initWithCallbackAndOnAdCloseCallback = function (callback, onAdCloseCallback) {
    this._callback = callback;
    this._onAdCloseCallback = onAdCloseCallback;
    return this;
  };
  GADBannerViewDelegateImpl.prototype.interstitialDidReceiveAd = function (ad) {
    this._callback(ad);
  };
  GADBannerViewDelegateImpl.prototype.interstitialDidDismissScreen = function (ad) {
    this._onAdCloseCallback();
  };
  GADBannerViewDelegateImpl.prototype.interstitialDidFailToReceiveAdWithError = function (ad, error) {
    this._callback(ad, error);
  };
  GADBannerViewDelegateImpl.ObjCProtocols = [GADInterstitialDelegate];
  return GADBannerViewDelegateImpl;
})(NSObject);

admob._getBannerType = function (size) {
  // Note that when the app is archived symbols like kGADAdSizeSmartBannerPortrait
  // are not available in {N}.. that's why we've hardcoded the runtime values here.

  // Dump these to the console in debug builds to find the currect definitions:
  // console.log("kGADAdSizeBanner: " + JSON.stringify(kGADAdSizeBanner));
  // console.log("kGADAdSizeLargeBanner: " + JSON.stringify(kGADAdSizeLargeBanner));
  // console.log("kGADAdSizeMediumRectangle: " + JSON.stringify(kGADAdSizeMediumRectangle));
  // console.log("kGADAdSizeFullBanner: " + JSON.stringify(kGADAdSizeFullBanner));
  // console.log("kGADAdSizeLeaderboard: " + JSON.stringify(kGADAdSizeLeaderboard));
  // console.log("kGADAdSizeSkyscraper: " + JSON.stringify(kGADAdSizeSkyscraper));
  // console.log("kGADAdSizeSmartBannerPortrait: " + JSON.stringify(kGADAdSizeSmartBannerPortrait));
  // console.log("kGADAdSizeSmartBannerLandscape: " + JSON.stringify(kGADAdSizeSmartBannerLandscape));
  // console.log("kGADAdSizeInvalid: " + JSON.stringify(kGADAdSizeInvalid));

  console.log(UIDeviceOrientation.UIDeviceOrientationPortrait);
  console.log(typeof(UIDeviceOrientation.UIDeviceOrientationPortrait));

  if (size === admob.AD_SIZE.BANNER) {
    // return kGADAdSizeBanner;
    return {"size": {"width": 320, "height": 50}, "flags": 0};
  } else if (size === admob.AD_SIZE.LARGE_BANNER) {
    // return kGADAdSizeLargeBanner;
    return {"size": {"width": 320, "height": 100}, "flags": 0};
  } else if (size === admob.AD_SIZE.MEDIUM_RECTANGLE) {
    // return kGADAdSizeMediumRectangle;
    return {"size": {"width": 300, "height": 250}, "flags": 0};
  } else if (size === admob.AD_SIZE.FULL_BANNER) {
    // return kGADAdSizeFullBanner;
    return {"size": {"width": 468, "height": 60}, "flags": 0};
  } else if (size === admob.AD_SIZE.LEADERBOARD) {
    // return kGADAdSizeLeaderboard;
    return {"size": {"width": 728, "height": 90}, "flags": 0};
  } else if (size === admob.AD_SIZE.SKYSCRAPER) {
    // return kGADAdSizeSkyscraper;
    return {"size": {"width": 120, "height": 600}, "flags": 0};
  } else if (size === admob.AD_SIZE.SMART_BANNER || size === admob.AD_SIZE.FLUID) {
    var orientation = utils.ios.getter(UIDevice, UIDevice.currentDevice).orientation;
    var isIPad = device.deviceType === DeviceType.Tablet;
    console.log(orientation);
    console.log(typeof(orientation));
    if (orientation === UIDeviceOrientation.Portrait || orientation === UIDeviceOrientation.PortraitUpsideDown) {
      // return kGADAdSizeSmartBannerPortrait;
      return {"size": {"width": 0, "height": 0, "smartHeight": isIPad ? 90 : 50}, "flags": 18};
    } else {
      // return kGADAdSizeSmartBannerLandscape;
      return {"size": {"width": 0, "height": 0, "smartHeight": isIPad ? 90 : 32}, "flags": 26};
    }
  } else {
    // return kGADAdSizeInvalid;
    return {"size": {"width": -1, "height": -1}, "flags": 0};
  }
};

admob.createBanner = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      if (admob.adView !== null && admob.adView !== undefined) {
        admob.adView.removeFromSuperview();
        admob.adView = null;
      }

      admob.defaults.view = utils.ios.getter(UIApplication, UIApplication.sharedApplication).keyWindow.rootViewController.view;
      var settings = admob.merge(arg, admob.defaults);
      var view = settings.view;
      var bannerType = admob._getBannerType(settings.size);

      // To get the actual size of the banner we can dump this (doesn't work for release builds)
      // var adViewSize = CGSizeFromGADAdSize(bannerType);
      // console.log(JSON.stringify(adViewSize));

      var adWidth = bannerType.size.width === 0 ? view.frame.size.width : bannerType.size.width;
      var adHeight = bannerType.size.smartHeight ? bannerType.size.smartHeight : bannerType.size.height;

      var originX = (view.frame.size.width - adWidth) / 2;
      var originY = settings.margins.top > -1 ? settings.margins.top : (settings.margins.bottom > -1 ? view.frame.size.height - adHeight - settings.margins.bottom : 0.0);
      var origin = CGPointMake(originX, originY);
      admob.adView = GADBannerView.alloc().initWithAdSizeOrigin(bannerType, origin);

      admob.adView.adUnitID = settings.iosBannerId;

      var adRequest = GADRequest.request();

      if (settings.testing) {
        var testDevices = ["Simulator"];
        if (settings.iosTestDeviceIds) {
          testDevices = testDevices.concat(settings.iosTestDeviceIds);
        }
        adRequest.testDevices = testDevices;
      }

      if (settings.keywords !== undefined) {
        adRequest.keywords = settings.keywords;
      }

      admob.adView.rootViewController = utils.ios.getter(UIApplication, UIApplication.sharedApplication).keyWindow.rootViewController;
      //var statusbarFrame = utils.ios.getter(UIApplication, UIApplication.sharedApplication).statusBarFrame;

      admob.adView.loadRequest(adRequest);

      // TODO consider listening to delegate features like 'ad loaded', but not for v1 (did do it for interstitial below already)
      //adView.delegate = self;

      view.addSubview(admob.adView);

      application.on(application.orientationChangedEvent, function (data) {
        if (admob.adView !== null) {
          admob.hideBanner().then(function (res) {
            admob.createBanner(arg);
          });
        }
      });

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
      admob.interstitialView = GADInterstitial.alloc().initWithAdUnitID(settings.iosInterstitialId);

      // with interstitials you MUST wait for the ad to load before showing it, so requiring this delegate
      var delegate = GADBannerViewDelegateImpl.new().initWithCallbackAndOnAdCloseCallback(
          function (ad, error) {
            if (error) {
              reject(error);
            } else {
              // now we can safely show it, but leave that to the calling code
              resolve();
            }
            delegate = undefined;
          },
          function () {
            arg.onAdClosed && arg.onAdClosed();
          });

      admob.interstitialView.delegate = delegate;

      var adRequest = GADRequest.request();

      if (settings.testing) {
        var testDevices = ["Simulator"];
        if (settings.iosTestDeviceIds) {
          testDevices = testDevices.concat(settings.iosTestDeviceIds);
        }
        adRequest.testDevices = testDevices;
      }

      admob.interstitialView.loadRequest(adRequest);
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
        admob.interstitialView.presentFromRootViewController(utils.ios.getter(UIApplication, UIApplication.sharedApplication).keyWindow.rootViewController);
        resolve();
      } else {
        reject("Please call 'preloadInterstitial' first.");
      }
    } catch (ex) {
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

admob.hideBanner = function () {
  return new Promise(function (resolve, reject) {
    try {
      if (admob.adView !== null) {
        //adView.delegate = null;
        admob.adView.removeFromSuperview();
        admob.adView = null;
      }
      resolve();
    } catch (ex) {
      console.log("Error in admob.hideBanner: " + ex);
      reject(ex);
    }
  });
};
var GADRewardBasedVideoAdDelegateImpl = (function (_super) {
  __extends(GADRewardBasedVideoAdDelegateImpl, _super);

  function GADRewardBasedVideoAdDelegateImpl() {
    _super.apply(this, arguments);
  }

  GADRewardBasedVideoAdDelegateImpl.new = function () {
    return _super.new.call(this);
  };
  GADRewardBasedVideoAdDelegateImpl.prototype.initWithCallback = function (loaded, error, callbacks) {
    this._callbacks = callbacks;
    this._loaded = loaded;
    this._error = error;
    return this;
  };
  GADRewardBasedVideoAdDelegateImpl.prototype.rewardBasedVideoAdDidReceiveAd = function (ad) {
    this._loaded();
  };
  GADRewardBasedVideoAdDelegateImpl.prototype.rewardBasedVideoAdDidFailToLoadWithError = function (ad, error) {
    this._error(error);
  };
  GADRewardBasedVideoAdDelegateImpl.prototype.rewardBasedVideoAdDidRewardUserWithReward = function (ad, reward) {
    this._callbacks.onRewarded(reward);
  };
  GADRewardBasedVideoAdDelegateImpl.prototype.rewardBasedVideoAdDidOpen = function (ad) {
    this._callbacks.onRewardedVideoAdOpened(ad);
  };
  GADRewardBasedVideoAdDelegateImpl.prototype.rewardBasedVideoAdDidStartPlaying = function (ad) {
    this._callbacks.onRewardedVideoStarted(ad);
  };
  GADRewardBasedVideoAdDelegateImpl.prototype.rewardBasedVideoAdDidCompletePlaying = function (ad) {
    this._callbacks.onRewardedVideoCompleted(ad);
  };
  GADRewardBasedVideoAdDelegateImpl.prototype.rewardBasedVideoAdDidClose = function (ad) {
    if (admob.videoView) {
      // admob.videoView.setRewardedVideoAdListener(null);
      admob.videoView = null;
    }
    this._callbacks.onRewardedVideoAdClosed(ad);
  };
  GADRewardBasedVideoAdDelegateImpl.prototype.rewardBasedVideoAdWillLeaveApplication = function (ad) {
    console.log("leftApplication")
    this._callbacks.onRewardedVideoAdLeftApplication(ad);
  };

  GADRewardBasedVideoAdDelegateImpl.ObjCProtocols = [GADRewardBasedVideoAdDelegate];
  return GADRewardBasedVideoAdDelegateImpl;
})(NSObject);

let rewardedVideoCallbacks = {
  onRewarded: () => { console.warn("onRewarded callback not set")},
  onRewardedVideoAdLeftApplication: () => {},
  onRewardedVideoAdClosed: () => {},
  onRewardedVideoAdOpened: () => {},
  onRewardedVideoStarted: () => {},
  onRewardedVideoCompleted: () => {},
}
var delegate = null;
admob.preloadRewardedVideoAd = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      admob.videoView = GADRewardBasedVideoAd.sharedInstance();

      // Rewarded ads must be loaded before they can be shown, so adding a listener
      function loaded() {
        resolve();
      }
      function error(errorMessage) {
        reject(errorMessage);
      }
      delegate = GADRewardBasedVideoAdDelegateImpl.new().initWithCallback(loaded, error, rewardedVideoCallbacks);
      admob.videoView.delegate = delegate;

      var settings = admob.merge(arg, admob.defaults);
      var adRequest = GADRequest.request();
      if (settings.testing) {
        settings.iosAdPlacementId = "ca-app-pub-3940256099942544/1712485313";
      }

      admob.videoView.loadRequestWithAdUnitID(adRequest, settings.iosAdPlacementId);
    } catch (ex) {
      console.log("Error in admob.preloadRewardedVideoAd: " + ex);
      reject(ex);
    }
  });
}
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
        admob.videoView.presentFromRootViewController(utils.ios.getter(UIApplication, UIApplication.sharedApplication).keyWindow.rootViewController);
        resolve();
      } else {
        reject("Please call 'preloadRewardedVideoAd' first.");
      }
    } catch (ex) {
      reject(ex);
    }
  });
};

module.exports = admob;
