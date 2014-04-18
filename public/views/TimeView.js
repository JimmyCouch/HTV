define([ 'jquery','underscore', 'text!templates/time.html', 'backbone'], function($, _, TimeTpl,Backbone) {
    'use strict';

    var TimeView = Backbone.View.extend({

    template: _.template(TimeTpl),

      initialize: function(options) {
        _.bindAll(this);
      },
      
      render: function () {
        this.$el.html(this.template());
        this.setTimeStamp();
        return this;
      },

      setTimeStamp: function (){
        this.date = new Date();
        this.year = this.date.getFullYear();
        this.month = this.date.getMonth() + 1;
        this.day = this.date.getDate();
        this.hours = this.date.getHours();
        this.minutes = this.date.getMinutes();
        this.seconds = this.date.getSeconds();
        this.daytime = ( this.hours < 12 ) ? "AM" : "PM";
        this.hours = ( this.hours > 12 ) ? this.hours - 12 : this.hours;
        this.hours = ( this.hours === 0 ) ? 12 : this.hours;
        this.minutes = ( this.minutes < 10 ? "0" : "" ) + this.minutes;
        this.seconds = ( this.seconds < 10 ? "0" : "" ) + this.seconds;
        this.$('#time').html(this.hours + ":" + this.minutes + ":" + this.seconds);
        this.$('#daytime').html(this.daytime);
        this.$('#date').html(this.month + "/" + this.day + "/" + this.year);
        var _this = this;
        setTimeout( function () {
          _this.setTimeStamp();
        }, 1000);
      },

    });

    return TimeView;
  });