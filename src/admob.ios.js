var admob = require('./admob-common');
var application = require('application');
var utils = require('utils/utils');
var device = require('platform').device;
var DeviceType = require('ui/enums').DeviceType;

// GADBannerViewDelegateImpl
// GADBannerViewDelegate

var GADBannerViewDelegateImplementation = (function(_super) {
  __extends(GADBannerViewDelegateImplementation, _super);

  function GADBannerViewDelegateImplementation() {
    _super.apply(this, arguments);
  }

  GADBannerViewDelegateImplementation.new = function() {
    return _super.new.call(this);
  };
  GADBannerViewDelegateImplementation.prototype.initWithCallback = function(
      callback) {
    this._callback = callback;
    return this;
  };

  // adViewDidReceiveAd
  GADBannerViewDelegateImplementation.prototype.adViewDidReceiveAd = function(
      ad) {
    this._callback(ad);
  };

  GADBannerViewDelegateImplementation.prototype
      .adViewDidFailToReceiveAdWithError = function(ad, error) {
    this._callback(ad, error);
  };

  GADBannerViewDelegateImplementation.ObjCProtocols = [GADBannerViewDelegate];
  return GADBannerViewDelegateImplementation;
})(NSObject);

var GADBannerViewDelegateImpl = (function(_super) {
  __extends(GADBannerViewDelegateImpl, _super);

  function GADBannerViewDelegateImpl() {
    _super.apply(this, arguments);
  }

  GADBannerViewDelegateImpl.new = function() {
    return _super.new.call(this);
  };
  GADBannerViewDelegateImpl.prototype.initWithCallback = function(callback) {
    this._callback = callback;
    return this;
  };
  GADBannerViewDelegateImpl.prototype.interstitialDidReceiveAd = function(ad) {
    this._callback(ad);
  };

  GADBannerViewDelegateImpl.prototype.interstitialDidFailToReceiveAdWithError =
      function(ad, error) {
    this._callback(ad, error);
  };
  GADBannerViewDelegateImpl.ObjCProtocols = [GADInterstitialDelegate];
  return GADBannerViewDelegateImpl;
})(NSObject);

admob._getBannerType = function(size) {
  // Note that when the app is archived symbols like
  // kGADAdSizeSmartBannerPortrait are not available in {N}.. that's why we've
  // hardcoded the runtime values here.

  // Dump these to the console in debug builds to find the currect definitions:
  // console.log("kGADAdSizeBanner: " + JSON.stringify(kGADAdSizeBanner));
  // console.log("kGADAdSizeLargeBanner: " +
  // JSON.stringify(kGADAdSizeLargeBanner));
  // console.log("kGADAdSizeMediumRectangle: " +
  // JSON.stringify(kGADAdSizeMediumRectangle));
  // console.log("kGADAdSizeFullBanner: " +
  // JSON.stringify(kGADAdSizeFullBanner)); console.log("kGADAdSizeLeaderboard:
  // " + JSON.stringify(kGADAdSizeLeaderboard));
  // console.log("kGADAdSizeSkyscraper: " +
  // JSON.stringify(kGADAdSizeSkyscraper));
  // console.log("kGADAdSizeSmartBannerPortrait: " +
  // JSON.stringify(kGADAdSizeSmartBannerPortrait));
  // console.log("kGADAdSizeSmartBannerLandscape: " +
  // JSON.stringify(kGADAdSizeSmartBannerLandscape));
  // console.log("kGADAdSizeInvalid: " + JSON.stringify(kGADAdSizeInvalid));

  if (size == admob.AD_SIZE.BANNER) {
    // return kGADAdSizeBanner;
    return {'size': {'width': 320, 'height': 50}, 'flags': 0};
  } else if (size == admob.AD_SIZE.LARGE_BANNER) {
    // return kGADAdSizeLargeBanner;
    return {'size': {'width': 320, 'height': 100}, 'flags': 0};
  } else if (size == admob.AD_SIZE.MEDIUM_RECTANGLE) {
    // return kGADAdSizeMediumRectangle;
    return {'size': {'width': 300, 'height': 250}, 'flags': 0};
  } else if (size == admob.AD_SIZE.FULL_BANNER) {
    // return kGADAdSizeFullBanner;
    return {'size': {'width': 468, 'height': 60}, 'flags': 0};
  } else if (size == admob.AD_SIZE.LEADERBOARD) {
    // return kGADAdSizeLeaderboard;
    return {'size': {'width': 728, 'height': 90}, 'flags': 0};
  } else if (size == admob.AD_SIZE.SKYSCRAPER) {
    // return kGADAdSizeSkyscraper;
    return {'size': {'width': 120, 'height': 600}, 'flags': 0};
  } else if (
      size == admob.AD_SIZE.SMART_BANNER || size == admob.AD_SIZE.FLUID) {
    var orientation =
        utils.ios.getter(UIDevice, UIDevice.currentDevice).orientation;
    var isIPad = device.deviceType === DeviceType.Tablet;
    if (orientation == UIDeviceOrientation.UIDeviceOrientationPortrait ||
        orientation ==
            UIDeviceOrientation.UIDeviceOrientationPortraitUpsideDown) {
      // return kGADAdSizeSmartBannerPortrait;
      return {
        'size': {'width': 0, 'height': 0, 'smartHeight': isIPad ? 90 : 50},
        'flags': 18
      };
    } else {
      // return kGADAdSizeSmartBannerLandscape;
      return {
        'size': {'width': 0, 'height': 0, 'smartHeight': isIPad ? 90 : 32},
        'flags': 26
      };
    }
  } else {
    // return kGADAdSizeInvalid;
    return {'size': {'width': -1, 'height': -1}, 'flags': 0};
  }
};

function _checkIfViewIsUIview(view) {
  return view.isKindOfClass(UIView);
}

function _checkIfViewIsTKSideDraer(view) {
  return view.isKindOfClass(TKSideDrawerView);
}

function _checkSubviewContent(view) {
  if (_checkIfViewIsTKSideDraer(view)) {
    _checkSubviewContent(view.subviews[0]);
  }
  return view;
}

admob.createBanner = function(arg) {
  return new Promise(function(resolve, reject) {
    try {
      if (admob.adView !== null && admob.adView !== undefined) {
        admob.adView.removeFromSuperview();
        admob.adView = null;
      }

      admob.defaults.view =
          utils.ios.getter(UIApplication, UIApplication.sharedApplication)
              .keyWindow.rootViewController.view;

      admob.defaults.view =
          _checkSubviewContent(admob.defaults.view.subviews[0]);


      // console.log((admob.defaults.view.subviews[0].subviews[0]));

      var settings = admob.merge(arg, admob.defaults);
      var view = admob.defaults.view;
      var bannerType = admob._getBannerType(settings.size);

      // To get the actual size of the banner we can dump this (doesn't work for
      // release builds) var adViewSize = CGSizeFromGADAdSize(bannerType);
      // console.log(JSON.stringify(adViewSize));

      var adWidth = bannerType.size.width === 0 ? view.frame.size.width :
                                                  bannerType.size.width;
      var adHeight = bannerType.size.smartHeight ? bannerType.size.smartHeight :
                                                   bannerType.size.height;

      var originX = parseInt((view.frame.size.width - adWidth) / 2);
      var originY = parseInt(
          settings.margins.top > -1 ?
              settings.margins.top :
              (settings.margins.bottom > -1 ?
                   view.frame.size.height - adHeight - settings.margins.bottom :
                   0.0));
      var origin = CGPointMake(originX, originY);


      admob.adView =
          GADBannerView.alloc().initWithAdSizeOrigin(bannerType, origin);

      admob.adView.adUnitID = settings.iosBannerId;

      var delegate =
          GADBannerViewDelegateImplementation.new().initWithCallback(function(
              ad, error) {
            if (error) {
              reject(error);
            } else {
              // now we can safely show it
              console.log('ADDING ADD VIEW TO VIEW');
              // view.addSubview(ad);
              resolve();
            }
            delegate = undefined;
          });

      var adRequest = GADRequest.request();

      // adRequest.delegate = delegate;

      if (settings.testing) {
        var testDevices = [];
        if (settings.iosTestDeviceIds) {
          testDevices = testDevices.concat(settings.iosTestDeviceIds);
        }
        adRequest.testDevices = testDevices;
      }


      if (settings.keywords !== undefined) {
        adRequest.keywords = settings.keywords;
      }

      admob.adView.rootViewController =
          utils.ios.getter(UIApplication, UIApplication.sharedApplication)
              .keyWindow.rootViewController;
      // var statusbarFrame = utils.ios.getter(UIApplication,
      // UIApplication.sharedApplication).statusBarFrame;
      admob.adView.delegate = delegate;
      view.addSubview(admob.adView);
      admob.adView.loadRequest(adRequest);

      // TODO consider listening to delegate features like 'ad loaded', but not
      // for v1 (did do it for interstitial below already) adView.delegate =
      // self;

      application.on(application.orientationChangedEvent, function(data) {
        if (admob.adView !== null) {
          admob.hideBanner().then(function(res) {
            admob.createBanner(arg);
          });
        }
      });

    } catch (ex) {
      console.log('Error in admob.createBanner: ' + ex);
      reject(ex);
    }
  });
};

admob.createInterstitial = function(arg) {
  return new Promise(function(resolve, reject) {
    try {
      var settings = admob.merge(arg, admob.defaults);
      admob.interstitialView =
          GADInterstitial.alloc().initWithAdUnitID(settings.iosInterstitialId);

      // with interstitials you MUST wait for the ad to load before showing it,
      // so requiring this delegate
      var delegate = GADBannerViewDelegateImpl.new().initWithCallback(function(
          ad, error) {
        if (error) {
          reject(error);
        } else {
          // now we can safely show it
          admob.interstitialView.presentFromRootViewController(
              utils.ios.getter(UIApplication, UIApplication.sharedApplication)
                  .keyWindow.rootViewController);
          resolve();
        }
        delegate = undefined;
      });
      admob.interstitialView.delegate = delegate;

      var adRequest = GADRequest.request();

      if (settings.testing) {
        var testDevices = [];
        if (settings.iosTestDeviceIds) {
          testDevices = testDevices.concat(settings.iosTestDeviceIds);
        }
        adRequest.testDevices = testDevices;
      }

      admob.interstitialView.loadRequest(adRequest);
    } catch (ex) {
      console.log('Error in admob.interstitialView: ' + ex);
      reject(ex);
    }
  });
};

admob.hideBanner = function() {
  return new Promise(function(resolve, reject) {
    try {
      if (admob.adView !== null) {
        // adView.delegate = null;
        admob.adView.removeFromSuperview();
        admob.adView = null;
      }
      resolve();
    } catch (ex) {
      console.log('Error in admob.hideBanner: ' + ex);
      reject(ex);
    }
  });
};

module.exports = admob;
