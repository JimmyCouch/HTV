
define([ 'jquery','underscore', 'text!templates/twitter.html', 'backbone','socket'], function($, _, TwTpl,Backbone,socket) {
    'use strict';

    var TwitterView = Backbone.View.extend({

    template: _.template(TwTpl),

      initialize: function(options) {
        _.bindAll(this);

          this.socket = options.socket;

          var _this = this;

          this.socket.on('sent-twitter-feed', function(data){

            _this.renderTwitterFeed(data);

          });



      },

      events: {
            "click #logout-link"            : "onLogoutClick",
            "click #remove-account-link"    : "onRemoveAccountClick"
      },

      render: function () {
        console.log("render twitter");
        this.$el.html(this.template());
            return this;
        },

        getTwitterFeed: function() {
          this.socket.emit('get-twitter-feed');

        },



        renderTwitterFeed: function(data) {


            console.log("response from server: ",data);

            var current_time = new Date();
            current_time = Date.parse(current_time);
            console.log(current_time);

            var list = document.getElementById('twitter-list');


            for(var i=0;i<10;i++){

              var entry = document.createElement('li');
              entry.className = "list-group-item";

              var tweetGroup = document.createElement('div');
              tweetGroup.className = "tweet-group";

              var header = document.createElement('div');
              header.className = "tweet-header"

              var name = document.createElement('p');
              name.className = "tweet-name";
              name.appendChild(document.createTextNode(data[i].user.name));

              var alias = document.createElement('p');
              alias.className = "tweet-alias";
              alias.appendChild(document.createTextNode("@" + data[i].user.screen_name));

              var time = document.createElement('p');
              time.className = "tweet-time";
              var tweetTime = data[i].created_at;
              var d = Date.parse(tweetTime);
              var timeDiff = current_time - d;

              timeDiff /= 1000;
              var seconds = Math.round(timeDiff % 60);
              timeDiff = Math.floor(timeDiff / 60);
              var minutes = Math.round(timeDiff % 60);
              timeDiff = Math.floor(timeDiff / 60);
              var hours = Math.round(timeDiff % 24);

              time.appendChild(document.createTextNode(hours + "h"));

              var retweetCount = document.createElement('div');
              retweetCount.className = "tweet-retweet";

              var retweetImage = document.createElement('img');
              retweetImage.className = "tweet-retweet-image"
              retweetImage.src = "/assets/img/retweet.png"
              retweetImage.height = "21";
              retweetImage.width = "21";

              var retweetText = document.createElement('p');
              retweetText.className = "tweet-retweet-text";
              retweetText.appendChild(document.createTextNode(data[i].retweet_count));

              retweetCount.appendChild(retweetImage);
              retweetCount.appendChild(retweetText);

              var favoriteCount = document.createElement('div');
              favoriteCount.className = "tweet-favorite";

              var favoriteImage = document.createElement('img');
              favoriteImage.className = "tweet-favorite-image";
              favoriteImage.src = "assets/img/favorite.png";
              favoriteImage.height = "21";
              favoriteImage.width = "21";

              var favoriteText = document.createElement('p');
              favoriteText.className = "tweet-favorite-text";
              favoriteText.appendChild(document.createTextNode(data[i].favorite_count))

              favoriteCount.appendChild(favoriteImage);
              favoriteCount.appendChild(favoriteText);

              header.appendChild(name);
              header.appendChild(alias);
              header.appendChild(time);
              header.appendChild(retweetCount);
              header.appendChild(favoriteCount);

              var tweet = document.createElement('p');
              tweet.className = "tweet-tweet";
              tweet.appendChild(document.createTextNode(data[i].text));

              tweetGroup.appendChild(header);
              tweetGroup.appendChild(tweet);

              var photo = document.createElement('img');
              photo.className = "twitter-photo"
              photo.src = data[i].user.profile_image_url;

              entry.appendChild(tweetGroup);
              entry.appendChild(photo);
              list.appendChild(entry);
            }



        },

    });

    return TwitterView;
  });
