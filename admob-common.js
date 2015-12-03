var admob = {};

// TODO make sure we use these, or remove unused items
admob.AD_SIZER = ["SMART", "BLA"];

admob.AD_SIZE = {
  SMART_BANNER: "SMART",
  LARGE_BANNER: "LARGE",
  BANNER: "BANNER",
  MEDIUM_RECTANGLE: "MEDIUM",
  FULL_BANNER: "FULL",
  LEADERBOARD: "LEADERBOARD",
  SKYSCRAPER: "SKYSCRAPER"
};

// TODO make sure we use these, or remove unused items
admob.AD_POSITION = {
  NO_CHANGE: 0,
  TOP_LEFT: 1,
  TOP_CENTER: 2,
  TOP_RIGHT: 3,
  LEFT: 4,
  CENTER: 5,
  RIGHT: 6,
  BOTTOM_LEFT: 7,
  BOTTOM_CENTER: 8,
  BOTTOM_RIGHT: 9,
  POS_XY: 10
};

admob.defaults = {
  margins: {
    top: -1,
    bottom: -1
  },
  testing: false,
  size: admob.AD_SIZE.SMART_BANNER,
  position: admob.AD_POSITION.TOP_CENTER // TODO verify this default
};

admob.merge = function merge(obj1, obj2){ // Our merge function
  var result = {}; // return result
  for(var i in obj1){      // for every property in obj1
    if((i in obj2) && (typeof obj1[i] === "object") && (i !== null)){
      result[i] = merge(obj1[i],obj2[i]); // if it's an object, merge
    }else{
      result[i] = obj1[i]; // add it to result
    }
  }
  for(i in obj2){ // add the remaining properties from object 2
    if(i in result){ //conflict
      continue;
    }
    result[i] = obj2[i];
  }
  return result;
};

module.adView = null;

module.exports = admob;