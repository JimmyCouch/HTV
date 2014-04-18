define([ 'jquery','underscore', 'text!templates/rss.html','text!templates/rss-mobile.html', 'backbone','socket','jsapi'], function($, _, RssTpl,RssTplMobile,Backbone,Socket,jsapi) {
    'use strict';

    var RssView = Backbone.View.extend({

    template: _.template(RssTpl),
    templateMobile: _.template(RssTplMobile),

      initialize: function(options) {
        _.bindAll(this);

        this.socket = options.socket;
        this.mobile = options.isMobile;

        setTimeout(function(){google.load('feeds', '1', {'callback':'console.log("2 sec wait")'})}, 2000);



      },

      events: {
            "click .rss-subcribe-btn" : "onSubscribe",
            "click #rss-goHome"       : "goHome",
            "click #rss-newsearch"    : "newRssSearch"
      },
      
      render: function (state) {

        if(state){
          this.$el.html(this.templateMobile());

        }
        else{
          this.$el.html(this.template());

        }
            return this;
        },


      newSearch: function(data) {



        var feedList = new Array();
        var _this = this;

        google.feeds.findFeeds(data, function(result) {
            if (!result.error) {
            var html = '';
            for (var i = 0; i < result.entries.length; i++) {
              var entry = result.entries[i];
              feedList[i] = entry.url;
              var count = i+1;
              html += '<div class="well" id="feed-' + i + '">';
              html += ' <h4><img id="rss-image" src="//s2.googleusercontent.com/s2/favicons?domain=' + entry.link + '"/>' + _this.removeHTMLTags(entry.title) + '</h4>';
              html += ' <p class="snippet">' + _this.removeHTMLTags(entry.contentSnippet) + '</p>';
              html += ' <p class="feedURL">';
              html += '<button type="button" id="'+entry.url+'"class="btn btn-primary rss-subcribe-btn">Subscribe</button>';
              html += '</div>';
            }
          
            $("#rss-results").fadeOut('slow', function() {
              // $('html, body').animate({scrollTop:0}, 'slow');
              $("#rss-results").empty();
              $("#rss-results").append(html);
              $("#rss-results").show();
            });   
             }
          });


      },

      removeHTMLTags: function(html){
          var cleanHTML = 
            html.replace(/&(lt|gt);/g, function (strMatch, p1){
              return (p1 == "lt")? "<" : ">";
              });
          return cleanHTML.replace(/<\/?[^>]+(>|$)/g, "");
        },

      goHome: function(){

        this.trigger('goHome',this);

      },

      newRssSearch: function(){

        this.selection = "news"

        this.trigger('renderSelection',this.selection);


      },

      onSubscribe: function(){


        var url = $(event.target).attr('id');

        this.socket.emit('get-rss-feed',url);


      },

      renderFeed: function(feed){

        console.log(feed);

         var html = "<ul id='list_group'>";


        $.each(feed, function(i,rss){

          console.log("RSS: ",rss.title);


          var title = (typeof(rss.title) != "undefined") ? rss.title : "";
          var author = (typeof(rss.author) != "undefined") ? rss.author : "";
          var content = (typeof(rss.content) != "undefined") ? rss.content : "";
          var published = (typeof(rss.published) != "undefined") ? rss.published : "";



          html += '<li class="list-group-item" id="rss_list_item">';
          html += '<div class="panel panel-default">'

              html +=  "<div class='panel-heading'>"
                  html += "<h3 class='panel-title'>"+title+"</h3>"
                  html += "<small>By "+author+" On "+published+"</small>"

              html += "</div>"  

              html += "<div class='panel-body'>"

                  html += content


              html += '</div>';

          html += '</div>'

      html += "</li>";



        });


      html += "</ul>";


      $('#rss_feed').animate({opacity:0}, 500, function(){
        $('#rss_feed').html(html);
        
        $("#rss_feed").css("height","auto"); 
      });
               
      $('#rss_feed').animate({opacity:1}, 500);    



      }



    });

    return RssView;
  });