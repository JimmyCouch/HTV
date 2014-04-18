
define([ 'app', 'jquery','underscore', 'text!templates/main.html','text!templates/mainMobile.html', 'backbone', 'views/TimeView', 'views/ForecastView','socket'], function(app,$, _, MainTpl,MobileMainTpl,Backbone, TimeView, ForecastView,socket) {
    'use strict';

    var MainView = Backbone.View.extend({

    template: _.template(MainTpl),
    templateMobile: _.template(MobileMainTpl),

      initialize: function(options) {
        _.bindAll(this);

        this.socket = options.socket;
        this.isMobile = options.mobile;
        var _this = this;

        this.socket.on('refresh-control', function(data){
          window.location ="/";
          app.settings.openProfile({id: "1"});
          // _this.render("tv");
        });

      },

      events: {
        "click #selection-box"     : "onSelectionClick",
        "mouseover img"            : "mouseovercard"
      },

      onSelectionClick: function (e) {
        this.selection = $(event.target).attr('id');
        this.socket.emit('control',{action: this.selection});
        console.log("selection click: ", this.selection);
        this.trigger('renderSelection',this.selection);
      },

      mouseovercard: function(event) {
        if (!this.isMobile){
          $('.block').removeClass('selected');
          $(event.currentTarget).parent().toggleClass('selected');
          $(event).parent().addClass('selected');
        }
      },

      render: function (state) {
        if (state == "tv"){
          this.$el.html(this.template());
          this.timeView = new TimeView();
          this.forecastView = new ForecastView();
          this.timeView.setElement(this.$('#time')).render();
          this.forecastView.setElement(this.$('#forecast')).render();
        }
        else if(state == "mobile"){
          this.$el.html(this.templateMobile());
        }

        return this;
      },

    });

    return MainView;
  });
