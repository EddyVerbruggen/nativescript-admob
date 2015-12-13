var admob = require("./admob-common");
var application = require("application");

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
  if (size == admob.AD_SIZE.BANNER) {
    return kGADAdSizeBanner;
  } else if (size == admob.AD_SIZE.LARGE_BANNER) {
    return kGADAdSizeLargeBanner;
  } else if (size == admob.AD_SIZE.MEDIUM_RECTANGLE) {
    return kGADAdSizeMediumRectangle;
  } else if (size == admob.AD_SIZE.FULL_BANNER) {
    return kGADAdSizeFullBanner;
  } else if (size == admob.AD_SIZE.LEADERBOARD) {
    return kGADAdSizeLeaderboard;
  } else if (size == admob.AD_SIZE.SKYSCRAPER) {
    return kGADAdSizeSkyscraper;
  } else if (size == admob.AD_SIZE.SMART_BANNER || size == admob.AD_SIZE.FLUID) {
    var orientation = UIDevice.currentDevice().orientation;
    if (orientation == UIDeviceOrientation.UIDeviceOrientationPortrait || orientation == UIDeviceOrientation.UIDeviceOrientationPortraitUpsideDown) {
      console.log("-------- orientation now portrait");
      return kGADAdSizeSmartBannerPortrait;
    } else {
      console.log("-------- orientation now landscape");
      return kGADAdSizeSmartBannerLandscape;
    }
  } else {
    return kGADAdSizeInvalid;
  }
};

admob.createBanner = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      if (admob.adView != null) {
        admob.adView.removeFromSuperview();
        admob.adView = null;
      }

      admob.defaults.view = UIApplication.sharedApplication().keyWindow.rootViewController.view;
      var settings = admob.merge(arg, admob.defaults);
      var view = settings.view;
      var bannerType = admob._getBannerType(settings.size);
      var adViewSize = CGSizeFromGADAdSize(bannerType);

      var originX = (view.frame.size.width - adViewSize.width) / 2;
      var originY = settings.margins.top > -1 ? settings.margins.top : (settings.margins.bottom > -1 ? view.frame.size.height - adViewSize.height - settings.margins.bottom : 0.0);
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

      admob.adView.rootViewController = UIApplication.sharedApplication().keyWindow.rootViewController;
      //var statusbarFrame = UIApplication.sharedApplication().statusBarFrame;

      admob.adView.loadRequest(adRequest);

      // TODO consider listening to delegate features like 'ad loaded', but not for v1 (did do it for interstitial below already)
      //adView.delegate = self;

      view.addSubview(admob.adView);

      application.on(application.orientationChangedEvent, function (data) {
        if (admob.adView != null) {
          console.log("-------- orientation changed to " + data.newValue + ", recreating the adview so it displays nicely");
          admob.hideBanner().then(function(res) {
            admob.createBanner(arg);
          })
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
          admob.interstitialView.presentFromRootViewController(UIApplication.sharedApplication().keyWindow.rootViewController);
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
      if (admob.adView != null) {
        //adView.delegate = null;
        admob.adView.removeFromSuperview();
        admob.adView = null;
      }
      resolve("Done");
    } catch (ex) {
      console.log("Error in admob.hideBanner: " + ex);
      reject(ex);
    }
  });
};

module.exports = admob;