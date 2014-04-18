
define([ 'jquery','underscore', 'text!templates/searchBar.html', 'backbone'], function($, _, SBTpl,Backbone) {
    'use strict';

    var SearchBarView = Backbone.View.extend({

    template: _.template(SBTpl),

      initialize: function(options) {
        _.bindAll(this);
      },

      events: {
            "click #closeModal"            : "closeSearchBar",
            "click #submitSearchData"      : "submitSearchData"
      },

      closeSearchBar: function() {
        this.trigger('onCloseSearchBar');
      },

      submitSearchData: function(){
        this.trigger('onSearchSubmit');
      },
      
      render: function () {
        this.$el.html(this.template());
        return this;
      },

      changeHeader: function(header) {

        if(header == "youtube"){
          $('.modal-title').text("Youtube Search");
        }
        if(header == "chrome"){
          $('.modal-title').text("Google Search");

        }
        if(header == "news"){
          $('.modal-title').text("Rss feed search");

        }
      }
      
    });

    return SearchBarView;
  });
