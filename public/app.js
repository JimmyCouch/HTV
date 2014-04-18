/**
 * @desc        app globals
 */
define([
    "jquery",
    "underscore",
    "backbone",
    "utils"
],
function($, _, Backbone) {

    var app = {
        root : "/",                     // The root path to run the application through.
        URL : "/",                      // Base application URL
        API : "/api",                   // Base API URL (used by models & collections)
    };

    $.ajaxSetup({ cache: false });          // force ajax call on all browsers


    // Global event aggregator
    app.eventAggregator = _.extend({}, Backbone.Events);

    return app;

});
