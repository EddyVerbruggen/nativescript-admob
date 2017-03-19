var admob = require("./admob-common");
var application = require("application");
var utils = require("utils/utils");

var GADBannerViewDelegateImpl = (function (_super) {
    __extends(GADBannerViewDelegateImpl, _super);
    function GADBannerViewDelegateImpl() {
      _super.apply(this, arguments);
    }
    GADBannerViewDelegateImpl.new = function () {
      return _super.new.call(this);
    };
    GADBannerViewDelegateImpl.prototype.initWithCallback = function (callback) {
      this._callback = callback;
      return this;
    };
    GADBannerViewDelegateImpl.prototype.interstitialDidReceiveAd = function (ad) {
      this._callback(ad);
    };
    GADBannerViewDelegateImpl.prototype.interstitialDidFailToReceiveAdWithError = function (ad, error) {
      this._callback(ad, error);
    };
    GADBannerViewDelegateImpl.ObjCProtocols = [GADInterstitialDelegate];
    return GADBannerViewDelegateImpl;
})(NSObject);

admob._getBannerType = function(size) {
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

  if (size == admob.AD_SIZE.BANNER) {
    // return kGADAdSizeBanner;
    return {"size":{"width":320,"height":50},"flags":0};
  } else if (size == admob.AD_SIZE.LARGE_BANNER) {
    // return kGADAdSizeLargeBanner;
    return {"size":{"width":320,"height":100},"flags":0};
  } else if (size == admob.AD_SIZE.MEDIUM_RECTANGLE) {
    // return kGADAdSizeMediumRectangle;
    return {"size":{"width":300,"height":250},"flags":0};
  } else if (size == admob.AD_SIZE.FULL_BANNER) {
    // return kGADAdSizeFullBanner;
    return {"size":{"width":468,"height":60},"flags":0};
  } else if (size == admob.AD_SIZE.LEADERBOARD) {
    // return kGADAdSizeLeaderboard;
    return {"size":{"width":728,"height":90},"flags":0};
  } else if (size == admob.AD_SIZE.SKYSCRAPER) {
    // return kGADAdSizeSkyscraper;
    return {"size":{"width":120,"height":600},"flags":0};
  } else if (size == admob.AD_SIZE.SMART_BANNER || size == admob.AD_SIZE.FLUID) {
    var orientation = utils.ios.getter(UIDevice, UIDevice.currentDevice).orientation;
    if (orientation == UIDeviceOrientation.UIDeviceOrientationPortrait || orientation == UIDeviceOrientation.UIDeviceOrientationPortraitUpsideDown) {
      // return kGADAdSizeSmartBannerPortrait;
      return {"size":{"width":0,"height":0},"flags":18};
    } else {
      // return kGADAdSizeSmartBannerLandscape;
      return {"size":{"width":0,"height":0},"flags":26};
    }
  } else {
    // return kGADAdSizeInvalid;
    return {"size":{"width":-1,"height":-1},"flags":0};
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

      var originX = (view.frame.size.width - bannerType.size.width) / 2;
      var originY = settings.margins.top > -1 ? settings.margins.top : (settings.margins.bottom > -1 ? view.frame.size.height - bannerType.size.height - settings.margins.bottom : 0.0);
      var origin = CGPointMake(originX, originY);
      admob.adView = GADBannerView.alloc().initWithAdSizeOrigin(bannerType, origin);

      admob.adView.adUnitID = settings.iosBannerId;

      var adRequest = GADRequest.request();

      if (settings.testing) {
        var testDevices = [kGADSimulatorID];
        if (settings.iosTestDeviceIds) {
          testDevices = testDevices.concat(settings.iosTestDeviceIds);
        }
        adRequest.testDevices = testDevices;
      }

      admob.adView.rootViewController = utils.ios.getter(UIApplication, UIApplication.sharedApplication).keyWindow.rootViewController;
      //var statusbarFrame = utils.ios.getter(UIApplication, UIApplication.sharedApplication).statusBarFrame;

      admob.adView.loadRequest(adRequest);

      // TODO consider listening to delegate features like 'ad loaded', but not for v1 (did do it for interstitial below already)
      //adView.delegate = self;

      view.addSubview(admob.adView);

      application.on(application.orientationChangedEvent, function (data) {
        if (admob.adView !== null) {
          admob.hideBanner().then(function(res) {
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

admob.createInterstitial = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      var settings = admob.merge(arg, admob.defaults);
      admob.interstitialView = GADInterstitial.alloc().initWithAdUnitID(settings.iosInterstitialId);

      // with interstitials you MUST wait for the ad to load before showing it, so requiring this delegate
      var delegate = GADBannerViewDelegateImpl.new().initWithCallback(function (ad, error) {
        if (error) {
          reject(error);
        } else {
          // now we can safely show it
          admob.interstitialView.presentFromRootViewController(utils.ios.getter(UIApplication, UIApplication.sharedApplication).keyWindow.rootViewController);
          resolve();
        }
        delegate = undefined;
      });
      admob.interstitialView.delegate = delegate;

      var adRequest = GADRequest.request();

      if (settings.testing) {
        var testDevices = [kGADSimulatorID];
        if (settings.iosTestDeviceIds) {
          testDevices = testDevices.concat(settings.iosTestDeviceIds);
        }
        adRequest.testDevices = testDevices;
      }

      admob.interstitialView.loadRequest(adRequest);
    } catch (ex) {
      console.log("Error in admob.interstitialView: " + ex);
      reject(ex);
    }
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

module.exports = admob;