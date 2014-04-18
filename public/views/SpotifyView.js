define([
    "app",
    "jquery",
    "underscore",

    "text!templates/spotify.html",

    "backbone",
    "socket",
    "parsley",
    "utils"
], function(app, $, _, SpotifyTpl, Backbone, socket){

    var SpotifyView = Backbone.View.extend({

      template: _.template(SpotifyTpl),

        initialize: function (options) {
            _.bindAll(this);

            this.socket = options.socket;
            this.isMobile = options.mobile;

            var _this = this;
            this.tracks = {};

            if (this.isMobile) {
              this.socket.on('spotify-results', function(data){
                _this.tracks = {};
                _this.tracks = data;
                _this.displayTracks();
              });
              this.socket.on('spotify-reset', function(data){
                  _this.$("#state-btn").html('Pause');
              });
              this.socket.on('spotify-null', function(data){
                  _this.$("#tracks").addClass('hide');
                  _this.$("#null").removeClass('hide');
                  setTimeout(function() {
                    _this.$("#null").addClass('hide');
                  }, 3000);
              });
            }
        },

        events: {
            'click #search-btn'       : 'searchSpotify',
            'click #close-btn'        : 'closeSpotify',
            'click #state-btn'        : 'stateChange',
            'submit spotify-form'     : 'searchSpotify',
            'click #0'                : 'playTrack',
            'click #1'                : 'playTrack',
            'click #2'                : 'playTrack',
            'click #3'                : 'playTrack',
            'click #4'                : 'playTrack',
        },

        searchSpotify: function(evt){
          var _this = this;
            if(evt) evt.preventDefault();
            if(this.$("#spotify-form").parsley('validate')){
              console.log(_this.$("#search-input").val());
              this.socket.emit('spotify-search', { query: _this.$("#search-input").val() });
              this.$("#search-input").val('');
            }
        },

        closeSpotify: function() {
            this.$("#spotifyModal").modal('hide');
            this.$("#tracks").addClass('hide');
        },

        displayTracks: function() {

          for ( i = 0; i < this.tracks.size; i++ ){
            this.$("#"+i).text(this.tracks[i].name + " - " +
            this.tracks[i].artist + " - " + this.tracks[i].time );
          }
          this.$("#tracks").removeClass('hide');
        },

        playTrack: function(evt) {
            this.socket.emit('spotify-play', { track: this.tracks[this.$(evt.currentTarget).attr('id')].href });
            this.$("#state-btn").removeClass('hide');
        },

        stateChange: function(evt){
          if (this.$(evt.currentTarget).text() == "Pause") {
            this.$(evt.currentTarget).html('Resume');
            this.socket.emit('spotify-pause');
          } else if (this.$(evt.currentTarget).text() == "Resume"){
            this.$(evt.currentTarget).html('Pause');
            this.socket.emit('spotify-resume');
          }
        },

        render: function () {
          this.$el.html(this.template());
          return this;
        }
    });

    return SpotifyView;
});
