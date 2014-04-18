
define([ 'jquery','underscore', 'text!templates/google.html', 'backbone','Mustache'], function($, _, GTpl,Backbone,Mustache) {
    'use strict';

    var GoogleView = Backbone.View.extend({

    template: _.template(GTpl),

      initialize: function(options) {
        _.bindAll(this);
      },
      newSearch: function(data) {
        $('.searchInput').text("Your google search is: " + data);

      },

      events: {
            "click #logout-link"            : "onLogoutClick",
            "click #remove-account-link"    : "onRemoveAccountClick"
      },
      
      render: function () {
        this.$el.html(this.template());
            return this;
        },

    });

    return GoogleView;
  });
