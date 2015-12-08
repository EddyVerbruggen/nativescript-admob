var observable = require("data/observable");
var admob = require("nativescript-admob");
//var dialogs = require("ui/dialogs");
var DemoAppModel = (function (_super) {
  __extends(DemoAppModel, _super);
  function DemoAppModel() {
    _super.call(this);
  }

  DemoAppModel.prototype.doCreateBanner = function (size) {
    admob.createBanner({
      // if the 'view' property is not set, the banner is overlayed on the current top most view
      testing: false,
      size: size,
      iosBannerId: "ca-app-pub-9517346003011652/3985369721",
      iosInterstitialId: "ca-app-pub-9517346003011652/6938836122", // Note: not used yet
      androidBannerId: "ca-app-pub-9517346003011652/7749101329",
      androidInterstitialId: "ca-app-pub-9517346003011652/6938836122", // Note: not used yet
      // Android automatically adds the connected device as test device with testing:true, iOS does not
      iosTestDeviceIds: ["yourTestDeviceUDIDs", "canBeAddedHere"],
      margins: {
        // if both are set, top wins
        //top: 10
        bottom: 50
      }
    }).then(
        function() {
          console.log("admob createBanner done");
        },
        function(error) {
          console.log("admob createBanner error: " + error);
        }
    )
  };

  DemoAppModel.prototype.doCreateSmartBanner = function () {
    this.doCreateBanner(admob.AD_SIZE.SMART_BANNER);
  };

  DemoAppModel.prototype.doCreateSkyscraperBanner = function () {
    this.doCreateBanner(admob.AD_SIZE.SKYSCRAPER);
  };

  DemoAppModel.prototype.doCreateLargeBanner = function () {
    this.doCreateBanner(admob.AD_SIZE.LARGE_BANNER);
  };

  DemoAppModel.prototype.doCreateRegularBanner = function () {
    this.doCreateBanner(admob.AD_SIZE.BANNER);
  };

  DemoAppModel.prototype.doCreateRectangularBanner = function () {
    this.doCreateBanner(admob.AD_SIZE.MEDIUM_RECTANGLE);
  };

  DemoAppModel.prototype.doCreateLeaderboardBanner = function () {
    this.doCreateBanner(admob.AD_SIZE.LEADERBOARD);
  };

  DemoAppModel.prototype.doHideBanner = function () {
    admob.hideBanner().then(
        function() {
          console.log("admob hideBanner done");
        },
        function(error) {
          console.log("admob hideBanner error: " + error);
        }
    )
  };

  return DemoAppModel;
})(observable.Observable);
exports.DemoAppModel = DemoAppModel;
exports.mainViewModel = new DemoAppModel();
