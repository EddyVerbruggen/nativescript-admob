//var utils = require("utils/utils");
var application = require("application");
//var frame = require("ui/frame");
var admob = require("./admob-common");
//var context = application.android.context;

admob._buildAdRequest = function (settings) {
  var builder = new com.google.android.gms.ads.AdRequest.Builder();
  if (settings.testing) {
    // This will request test ads on the emulator and device by passing this hashed device ID.
    var activity = application.android.foregroundActivity;
    var ANDROID_ID = android.provider.Settings.Secure.getString(activity.getContentResolver(), android.provider.Settings.Secure.ANDROID_ID);
    var deviceId = md5(ANDROID_ID).toUpperCase();
    builder = builder.addTestDevice(deviceId).addTestDevice(com.google.android.gms.ads.AdRequest.DEVICE_ID_EMULATOR);
  }
  var bundle = new android.os.Bundle();
  bundle.putInt("cordova", 1); //TODO
  // TODO
  /*
   if (adExtras != null) {
   Iterator<String> it = adExtras.keys();
   while (it.hasNext()) {
   String key = it.next();
   try {
   bundle.putString(key, adExtras.get(key).toString());
   } catch (JSONException exception) {
   Log.w(LOGTAG, String.format("Caught JSON Exception: %s", exception.getMessage()));
   }
   }
   }
   */
  var adextras = new com.google.android.gms.ads.mediation.admob.AdMobExtras(bundle);
  builder = builder.addNetworkExtras(adextras);
  var request = request_builder.build();
  return request;
};

admob.createBanner = function(arg) {
  return new Promise(function (resolve, reject) {
    try {
      var settings = admob.merge(arg, admob.defaults);

      var activity = application.android.foregroundActivity;
      if (admob.adView == null) {
        admob.adView = new com.google.android.gms.ads.AdView(activity);
        //admob.adView.setAdUnitId("ca-app-pub-6869992474017983/9375997553"); // TODO
        admob.adView.setAdSize(com.google.android.gms.ads.AdSize.SMART_BANNER); // settings.size); // TODO get from settings
        //admob.adView.setAdListener(new com.google.android.gms.ads.BannerListener()); // TODO see https://github.com/floatinghotpot/cordova-plugin-admob/blob/master/src/android/AdMob.java#L494
      }
      admob.adView.loadAd(admob._buildAdRequest(settings));
      //if (autoShowBanner) { // TODO
      //  executeShowAd(true, null);
      //}

      var adViewLayout = new android.widget.FrameLayout(activity);
      adViewLayout.addView(admob.adView);
      var topMostFrame = frame.topmost();
      topMostFrame.currentPage.android.getParent().addView(adViewLayout);

      //admob.adView.setVisibility(android.view.View.VISIBLE);


      /*
       mapView = new com.mapbox.mapboxsdk.views.MapView(context, settings.accessToken);
       mapView.onResume();
       mapView.onCreate(null);
       mapView.setStyleUrl("asset://styles/" + mapbox.getStyle(settings.style) + "-v8.json");

       var topMostFrame = frame.topmost(),
       density = utils.layout.getDisplayDensity(),
       left = settings.margins.left * density,
       right = settings.margins.right * density,
       top = settings.margins.top * density,
       bottom = settings.margins.bottom * density,
       viewWidth = topMostFrame.currentPage.android.getWidth(),
       viewHeight = topMostFrame.currentPage.android.getHeight();

       var params = new android.widget.FrameLayout.LayoutParams(viewWidth - left - right, viewHeight - top - bottom);
       params.setMargins(left, top, right, bottom);
       mapView.setLayoutParams(params);

       if (settings.center) {
       mapView.setCenterCoordinate(new com.mapbox.mapboxsdk.geometry.LatLngZoom(settings.center.lat, settings.center.lng, settings.zoomLevel));
       } else {
       mapView.setZoomLevel(settings.zoomLevel);
       }

       mapView.setCompassEnabled(!settings.hideCompass);
       mapView.setRotateEnabled(!settings.disableRotation);
       mapView.setScrollEnabled(!settings.disableScroll);
       mapView.setZoomEnabled(!settings.disableZoom);

       if (settings.showUserLocation) {
       if (mapbox._fineLocationPermissionGranted()) {
       mapView.setMyLocationEnabled(true);
       } else {
       // devs should ask permission upfront, otherwise enabling location will crash the app on Android 6
       console.log("Mapbox plugin: not showing the user location on this device because persmission was not requested/granted");
       }
       }

       // if we want to hide this, just render it outside the view
       if (settings.hideAttribution) {
       mapView.setAttributionMargins(-300,0,0,0);
       }
       // same can be done for the logo
       if (settings.hideLogo) {
       mapView.setLogoMargins(-300,0,0,0);
       }

       var activity = application.android.foregroundActivity;
       var mapViewLayout = new android.widget.FrameLayout(activity);
       mapViewLayout.addView(mapView);
       topMostFrame.currentPage.android.getParent().addView(mapViewLayout);

       if (settings.markers) {
       for (var m in settings.markers) {
       var marker = settings.markers[m];
       var markerOptions = new com.mapbox.mapboxsdk.annotations.MarkerOptions();
       markerOptions.title(marker.title);
       markerOptions.snippet(marker.subtitle);
       markerOptions.position(new com.mapbox.mapboxsdk.geometry.LatLng(marker.lat, marker.lng));
       mapView.addMarker(markerOptions);
       }
       }
       */
      resolve();
    } catch (ex) {
      console.log("Error in admob.createBanner: " + ex);
      reject(ex);
    }
  });
};

admob.hideBanner = function(arg) {
  return new Promise(function (resolve, reject) {
    try {
      resolve();
    } catch (ex) {
      console.log("Error in admob.hideBanner: " + ex);
      reject(ex);
    }
  });
};

module.exports = admob;