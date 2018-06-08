import { Observable } from "tns-core-modules/data/observable";
import { AD_SIZE, createBanner, createInterstitial, hideBanner } from "nativescript-admob";
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

  }

  private doCreateInterstitial(size: AD_SIZE): void {
    const testing = true;
    createInterstitial({
      testing: true,
      iosInterstitialId: "ca-app-pub-9517346003011652/6938836122",
      androidInterstitialId: "ca-app-pub-9517346003011652/6938836122"
    }).then(
        () => this.message = "Interstitial created",
        error => this.message = "Error creating interstitial: " + error
    )
  }
}
