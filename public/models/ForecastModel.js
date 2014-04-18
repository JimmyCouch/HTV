define([ 'jquery','underscore', 'backbone'], function($, _, Backbone) {
    'use strict';

    var ForecastModel = Backbone.Model.extend({

      initialize: function(options) {
        _.bindAll(this);

        this.index = {};
      },

      parse: function(val) {
        this.index.lat = val.results[0].geometry.location.lat;
        this.index.lon = val.results[0].geometry.location.lng;
        this.index.name = val.results[0].address_components[1].long_name;
      },

    });

    return ForecastModel;
  });