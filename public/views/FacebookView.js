
define([ 'jquery','underscore', 'text!templates/facebook.html', 'backbone','socket'], function($, _, FbTpl,Backbone,socket) {
    'use strict';

    var FacebookView = Backbone.View.extend({

    template: _.template(FbTpl),

      initialize: function(options) {
        _.bindAll(this);

        this.socket = options.socket;

        var _this = this;

        this.socket.on('sent-facebook-feed', function(data){
          console.log(data);

          _this.renderFacebookFeed(data);

        });

        


      },

      events: {
            "click #logout-link"            : "onLogoutClick",
            "click #remove-account-link"    : "onRemoveAccountClick"
      },
      
      render: function () {
        this.$el.html(this.template());
            return this;
        },


        renderFacebookFeed: function(data) {

          console.log(data);

          var json = new Array();


          for(var i=0;i<4;i++){
            json[i] = data.data[i];
          }

          console.log(json);


          var list_height = 50;

          $("#fb_feed").css("height",list_height+"px");

          $("#fb_feed").html('<div class="loading_div"></div>');

          
           var html = "<ul id='list_group'>";
          

           $.each(json,function(i,fb){



                var msg = (typeof(fb.message) != "undefined") ? fb.message : "";
                var link = (typeof(fb.link) != "undefined") ? fb.link : ""; 
                var pic = (typeof(fb.picture) != "undefined") ? fb.picture : "";
                var story = (typeof(fb.story) != "undefined") ? fb.story: "";
                var likes = (typeof(fb.likes) != "undefined") ? fb.likes: "";
                var likes_data = (typeof(likes.data) != "undefined") ? likes.data: "";
                var likes_count = (typeof(likes_data.length) != "undefined") ? likes_data.length: "0";
                var shares = (typeof(fb.shares) != "undefined") ? fb.shares: "";
                var shares_count = (typeof(shares.count) != "undefined") ? shares.count: "0";
                var comments = (typeof(fb.comments) != "undefined") ? fb.comments: "";
                var comments_data = (typeof(comments.data) != "undefined") ? comments.data: "";
                var comments_count = (typeof(comments_data.length) != "undefined") ? comments_data.length: "0";


                html += '<li class="list-group-item" id="fb_list_item">';
                    html += '<div class="panel panel-default">'

                        html +=  "<div class='panel-heading'>"+fb.from.name+"</div>"  

                        html += "<div class='panel-body'>"

                            html += '<div class="fb_group1">';
                            html += (pic != "") ? "<img class='fb_img' src='" + pic + "' />" : "";
                            html += '</div>';
                            html += '<div class="fb_group2">'
                            html += "<div class='fb_link' target='_blank'>"+ msg + story + "</div>";
                            html += '</div>';

                        html += '</div>';

                        html += '<div class="panel-footer" id="fb_footer">'

                            html += '<span class="fb_span">'
                                html += '<i class="fb-icon-likes"></i>'
                                html += '<span class="fb_likes">'+likes_count+'</span>'
                            html += '</span>'

                            html += '<span class="fb_span">'
                                html += '<i class="fb-icon-shares"></i>'
                                html += '<span class="fb_shares">'+shares_count+'</span>'
                            html += '</span>'

                            html += '<span class="fb_span">'
                                html += '<i class="fb-icon-comments"></i>'
                                html += '<span class="fb_comments">'+comments_count+'</span>'
                            html += '</span>'


                        html += '</div>'
                    html += '</div>'

                html += "</li>";
          
           }); 
          
           html += "</ul>";
          
          
           $('#fb_feed').animate({opacity:0}, 500, function(){
             $('#fb_feed').html(html);
             
             $("#fb_feed").css("height","auto"); 
           });
          
           $('#fb_feed').animate({opacity:1}, 500);
          


        }

    });

    return FacebookView;
  });