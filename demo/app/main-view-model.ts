import { Observable } from "tns-core-modules/data/observable";
import {
  AD_SIZE,
  createBanner,
  createInterstitial,
  hideBanner,
  preloadInterstitial,
  showInterstitial,
  preloadRewardedVideoAd,
  showRewardedVideoAd
} from "nativescript-admob";
import { isIOS } from "tns-core-modules/platform";

export class HelloWorldModel extends Observable {

  private _message: string;

  get message(): string {
    return this._message;
  }

  set message(value: string) {
    if (this._message !== value) {
      this._message = value;
      this.notifyPropertyChange("message", value)
    }
  }

  doHideBanner(): void {
    hideBanner().then(
        () => this.message = "Banner hidden",
        error => this.message = "Error hiding banner: " + error
    );
  }


  doPreloadInterstitial(): void {
    preloadInterstitial({
      testing: true,
      iosInterstitialId: "ca-app-pub-9517346003011652/6938836122",
      androidInterstitialId: "ca-app-pub-9517346003011652/6938836122",
      onAdClosed: () => this.message = "Interstitial closed"
    }).then(
        () => this.message = "Interstitial preloaded",
        error => this.message = "Error preloading interstitial: " + error
    )
  }

  doShowInterstitial(): void {
    showInterstitial().then(
        () => this.message = "Interstitial showing",
        error => this.message = "Error showing interstitial: " + error
    )
  }

  doCreateInterstitial(): void {
    createInterstitial({
      testing: true,
      iosInterstitialId: "ca-app-pub-9517346003011652/6938836122",
      androidInterstitialId: "ca-app-pub-9517346003011652/6938836122",
      onAdClosed: () => this.message = "Interstitial closed"
    }).then(
        () => this.message = "Interstitial created",
        error => this.message = "Error creating interstitial: " + error
    )
  }
  doPreloadRewarded(): void {
    this.message = "preloading rewarded video";
    preloadRewardedVideoAd({
      testing: true,
      iosAddPlacementId: "ca-app-pub-3940256099942544/1712485313",
      androidAddPlacementId: "ca-app-pub-3940256099942544/5224354917",
    })
    .then(() => this.message = "RewardedVideo preloaded")
    .catch(error => this.message = "Error preloading rewarded Video: " + error)
  }
  doShowRewarded(): void {
    showRewardedVideoAd({
      onRewarded: () => this.message = "watched rewarded video",
      onRewardedVideoAdLeftApplication: () => console.log("onRewardedVideoAdLeftApplication"),
      onRewardedVideoAdClosed: () => this.message = "closed rewarded video",
      onRewardedVideoAdOpened: () => console.log("onRewardedVideoAdOpened"),
      onRewardedVideoStarted: () => console.log("onRewardedVideoStarted"),
      onRewardedVideoCompleted: () => console.log("onRewardedVideoCompleted"),
    })
    .then(() => {
      this.message = "showing rewarded video";
    })
    .catch( error => this.message = "Error showing rewarded Video: " + error)
  }
  doCreateSmartBanner(): void {
    this.createBanner(AD_SIZE.SMART_BANNER);
  };

  doCreateSkyscraperBanner(): void {
    this.createBanner(AD_SIZE.SKYSCRAPER);
  };

  doCreateLargeBanner(): void {
    this.createBanner(AD_SIZE.LARGE_BANNER);
  };

  doCreateRegularBanner(): void {
    this.createBanner(AD_SIZE.BANNER);
  };

  doCreateRectangularBanner(): void {
    this.createBanner(AD_SIZE.MEDIUM_RECTANGLE);
  };

  doCreateLeaderboardBanner(): void {
    this.createBanner(AD_SIZE.LEADERBOARD);
  };

  private createBanner(size: AD_SIZE): void {
    const testing = true;
    createBanner({
      testing: testing,
      // if this 'view' property is not set, the banner is overlayed on the current top most view
      // view: ..,
      size: size,
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
  }
}
