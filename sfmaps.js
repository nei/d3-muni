 var sfMaps = (function($) {

    var neighborhoods = function (callback) {
         callback();
    };

    var arteries = function (callback) {
         callback();
    };

    var freeways = function (callback) {
         callback();
    };

    var streets = function (callback) {
        
        callback();
    };

     return {
        neighborhoods: neighborhoods,
        arteries: arteries,
        freeways: freeways,
        streets: streets
     };

 })(jQuery);