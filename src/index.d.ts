/// <reference path="admob-common.d.ts"/>
import { preloadInterstitial } from "nativescript-admob";

declare module "nativescript-admob" {

    /**
     * The options object passed into the createBanner function.
     */
    export interface CreateBannerOptions {
      /**
       * The view you want to embed the ad into.
       * iOS only, where the default is: UIApplication.sharedApplication().keyWindow.rootViewController.view
       */
      view?: any;

      /**
       * The layout of the banner.
       * Default AD_SIZE.SMART_BANNER
       */
      size?: AD_SIZE;

      /**
       * When false (default) you'll get real banners.
       */
      testing?: boolean;

      /**
       * Something like "ca-app-pub-AAAAAAAA/BBBBBBB".
       */
      androidBannerId?: string;

      /**
       * Something like "ca-app-pub-XXXXXX/YYYYYY".
       */
      iosBannerId?: string;

      /**
       * If testing is true, the simulator is allowed to receive test banners.
       * Android automatically add the connceted device as test device, but iOS does not.
       * If you also want to test on real devices, add it here like this:
       *   ["ce97330130c9047ce0d4430d37d713b1", ".."]
       */
      iosTestDeviceIds?: string[];

      /**
       * The number of pixels from the top/bottom of the view antural
       * position of this banner size (type).
       * The plugin corrects for display density, so don't worry about that.
       *
       * If both are set, top wins.
       */
      margins?: {
        /**
         * Default: -1 (ignored).
         */
        top?: number;

        /**
         * Default: -1 (ignored).
         */
        bottom?: number;
      },

      /**
       * Specify keywords for ad targeting
       */
      keywords?: string[];
    }

    export interface CreateInterstitialOptions {
      /**
       * When false (default) you'll get real banners.
       */
      testing?: boolean;

      /**
       * Something like "ca-app-pub-AAAAAAAA/BBBBBBB".
       */
      androidInterstitialId?: string;

      /**
       * Something like "ca-app-pub-XXXXXX/YYYYYY".
       */
      iosInterstitialId?: string;

      /**
       * If testing is true, the simulator is allowed to receive test banners.
       * Android automatically add the connceted device as test device, but iOS does not.
       * If you also want to test on real devices, add it here like this:
       *   ["ce97330130c9047ce0d4430d37d713b1", ".."]
       */
      iosTestDeviceIds?: string[];

      /**
       * Specify keywords for ad targeting
       */
      keywords?: string[];

      /**
       * Invoked when the user closes the interstitial.
       */
      onAdClosed?: () => void;
    }

    /**
     * Request a banner from the server and show it when it's ready.
     */
    export function createBanner(options: CreateBannerOptions): Promise<any>;

    /**
     * If you want to show a different banner than the one showing you don't need to call
     * 'hideBanner since `createBanner` will do that for you to prevent your app from crashing.
     */
    export function hideBanner(): Promise<any>;

    /**
     * To show a fullscreen banner you can use this function.
     * Note that Interstitial banners need to be loaded before they can be shown,
     * so use this function, and when the promise resolves you can call 'showInterstitial'.
     * If you don't want to use 2 steps, use createInterstitial instead, but there will be a (preloading) delay
     * which is not recommended.
     */
    export function preloadInterstitial(options: CreateInterstitialOptions): Promise<any>;

    /**
     * Use after the 'preloadInterstitial' promise has resolved. It should immediately show the interstitial,
     * as opposed to the delay you'd see when using 'createInterstitial'.
     */
    export function showInterstitial(): Promise<any>;

    /**
     * @Deprecated use 'preloadInterstitial' and 'showInterstitial' instead.
     *
     * To show a fullscreen banner you can use this function.
     * Note that Interstitial banners need to be loaded before they can be shown,
     * but don't worry: this plugin will manage that transparently for you.
     * However, Google won't like it too much, because there will be a delay.
     */
    export function createInterstitial(options: CreateInterstitialOptions): Promise<any>;

    /**
     */
    export interface CreateRewardedOptions {
     /**
      * When false (default) you'll get real banners.
      */
     testing?: boolean;

     /**
      * Something like "ca-app-pub-AAAAAAAA/BBBBBBB".
      */
     androidAddPlacementId?: string;

     /**
      * Something like "ca-app-pub-XXXXXX/YYYYYY".
      */
     iosAddPlacementId?: string;

     /**
      * If testing is true, the simulator is allowed to receive test banners.
      * Android automatically add the connceted device as test device, but iOS does not.
      * If you also want to test on real devices, add it here like this:
      *   ["ce97330130c9047ce0d4430d37d713b1", ".."]
      */
     iosTestDeviceIds?: string[];

     /**
      * Specify keywords for ad targeting
      */
     keywords?: string[];
     /**
      * Invoked when the user closes the interstitial.
      */
    }
    export interface ShowRewardedOptions {
      onRewarded?: (reward: any) => void;
      onRewardedVideoAdLeftApplication?: () => void;
      onRewardedVideoAdClosed?: () => void;
      onRewardedVideoAdOpened?: () => void;
      onRewardedVideoStarted?: () => void;
      onRewardedVideoCompleted?: () => void;
    }
    export interface AdReward {
      /**
       * Type of the reward.
       */
      type: string;

      /**
       * Amount rewarded to the user.
       */
      amount: number;
    }
    /**
     * To show a reward video add you can use this function to preload the ad.
     */
    export function preloadRewardedVideoAd(options: CreateRewardedOptions): Promise<any>;
    /**
     * To show a reward video add you can use this function to preload the ad.
     */
    export function showRewardedVideoAd(options: ShowRewardedOptions): Promise<any>;
}
