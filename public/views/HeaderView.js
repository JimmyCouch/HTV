
define([ 'jquery','underscore', 'text!templates/header.html', 'backbone'], function($, _, HTpl,Backbone) {
    'use strict';

    var HeaderView = Backbone.View.extend({

    template: _.template(HTpl),

      initialize: function(options) {
        _.bindAll(this);

        


      },

      events: {
            "click .backButton"            : "goBack"
      },
      
      render: function () {
        this.$el.html(this.template());
            return this;
        },


        goBack: function() {

          this.trigger('goBack');

        }

    });

    return HeaderView;
  });
