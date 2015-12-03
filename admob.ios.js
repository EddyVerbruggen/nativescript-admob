var admob = require("./admob-common");
var application = require("application");

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
  } else if (size == admob.AD_SIZE.SMART_BANNER) {
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
}

admob.createBanner = function (arg) {
  return new Promise(function (resolve, reject) {
    try {
      if (admob.adView != null) {
        reject("Please hide an already showing banner first.");
        return;
      }

      admob.defaults.view = UIApplication.sharedApplication().keyWindow.rootViewController.view;
      var settings = admob.merge(arg, admob.defaults);
      var view = settings.view;
      var bannerType = admob._getBannerType(settings.size);
      var adViewSize = CGSizeFromGADAdSize(bannerType);

      var originY = settings.margins.top > -1 ? settings.margins.top : (settings.margins.bottom > -1 ? view.frame.size.height - adViewSize.height - settings.margins.bottom : 0.0);
      var origin = CGPointMake(0.0, originY);
      admob.adView = GADBannerView.alloc().initWithAdSizeOrigin(bannerType, origin);

      admob.adView.adUnitID = settings.bannerId; // TODO pass in the publisher ID (this is the Banner ID for the {N} iOS demo app)

      var adRequest = GADRequest.request();

      if (settings.testing) {
        var testDevices = [kGADSimulatorID];
        if (settings.testDeviceIds) {
          testDevices = testDevices.concat(settings.testDeviceIds);
        }
        adRequest.testDevices = testDevices;
      }

      admob.adView.rootViewController = UIApplication.sharedApplication().keyWindow.rootViewController;
      //var statusbarFrame = UIApplication.sharedApplication().statusBarFrame;

      admob.adView.loadRequest(adRequest);

      // TODO consider listening to delegate features like 'ad loaded', but not for the 1.0 version. See https://developers.google.com/admob/ios/banner
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