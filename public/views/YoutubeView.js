
define([ 'jquery','underscore', 'text!templates/youtube.html','text!templates/youtubePlay.html','text!templates/youtubeRemote.html', 'backbone','Mustache','touchswipe','scrollTo','socket','yt'], function($, _, YtTpl,YtPlayTpl,YtRemoteTpl,Backbone,Mustache,touchswipe,scrollTo,Socket,yt) {
    'use strict';

    var YoutubeView = Backbone.View.extend({

    template: _.template(YtTpl),
    templatePlay: _.template(YtPlayTpl),
    templateRemote: _.template(YtRemoteTpl),

      initialize: function(options) {
        _.bindAll(this);

        this.socket = options.socket;
        this.isMobile = options.mobile;
        var _this = this;

        this.socket.on('youtube-control', function(data){
           _this.$el.html(_this.templatePlay());
        });

        this.socket.on('youtube-ctl-btn', function(data){
            _this.$('#playOrPause').html("Pause");
        });

        this.socket.on('youtube-toggle-control', function(data){

          if(data.action == false){
          $('.playPauseButton').attr('src','assets/img/playbutton.svg');
            _this.player.pauseVideo();
          }
          if(data.action == true){
          $('.playPauseButton').attr('src','assets/img/pausebutton.png');
            _this.player.playVideo();
          }

        });

      },

      events: {
             "click .videoBlock"           : "onClickVideo",
             "click .playPauseButton"      : "toggleVideo",
             "click #youtube-goHome"       : "goHome",
             "click #playOrPause"          : "toggleVideo",
             "click #closeModal"           : "closeModal",
             "click #youtube-newsearch"    : "newYoutubeSearch"
      },


      goHome: function(){
        this.trigger('goHome',this);
      },

      newYoutubeSearch: function(){
        this.selection = "youtube"
        this.trigger('renderSelection',this.selection);
      },

      closeModal: function() {
        this.socket.emit('youtube-stop');
      },

      toggleVideo: function(data) {
          var selection = $('#playOrPause').html();
          if (selection == "Pause"){
            this.socket.emit('youtube-playback', { id: this.selection });
            $('#playOrPause').html("Play");
          }
          else if(selection == "Play"){
            this.socket.emit('youtube-playback', { id: this.selection });
            $('#playOrPause').html("Pause");
          }
      },

      onClickVideo: function(e) {
        if(this.isMobile){
          this.selection = $(event.target).attr('id');
          this.socket.emit('play-youtube',{id: this.selection});
          $('#youtube-control-modal').modal('show');
        }
      },

      newSearch: function(data) {
        $('.searchInput').text("Your youtube search is: " + data);
        var max_videos = 12;
        var url = "http://gdata.youtube.com/feeds/api/videos?vq=" + escape(data) + "&max-results=" + max_videos + "&alt=json-in-script&callback=?";

        var _this = this;

        $.getJSON(url, function(data){
          $("ul.video").html("");
          var jsonObj = [];
          $(data.feed.entry).each(function(key, item){
            var a = item.id.$t.split("/"),
              id = a[6],
              title = item.title.$t,
              thumbnail = item.media$group.media$thumbnail[0].url,
              totalSec = item.media$group.yt$duration.seconds,
              hours = parseInt( totalSec / 3600 ) % 24,
              minutes = parseInt( totalSec / 60 ) % 60,
              seconds = totalSec % 60;

            var duration = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
            jsonObj = {
              id:id,
              title:title,
              thumbnail:thumbnail,
              duration:duration};

              $('#videoTpl').hide();
             var template = $('#videoTpl').html(),
               html = Mustache.to_html(template, jsonObj);
             $('ul.video').append(html);
          });
        });
      },

      render: function () {
        this.$el.html(this.template());
            return this;
        },

    });

    return YoutubeView;
  });
