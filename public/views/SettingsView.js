define([
    "app",
    "jquery",
    "underscore",

    "text!templates/settings.html",

    "backbone",
    "parsley",
    "utils"
], function(app, $, _, SettingsTpl, Backbone){

    var SettingsView = Backbone.View.extend({

      template: _.template(SettingsTpl),

        initialize: function (options) {
            _.bindAll(this);

            this.socket = options.socket;

            this.socket.on('sent-twitter-status',function(data){

                if(data == "logged_in"){
                    $('.tw').text("Log Out");
                    $('.tw').attr('id','tw-logout');

                }
                else if(data == "logged_out"){
                    $('.tw').text("Log in");
                    $('.tw').attr('id','tw-login');

                }

            });

            this.socket.on('sent-facebook-status',function(data){


                if(data == "logged_in"){
                    $('.fb').text("Log out");
                    $('.fb').attr('id',"fb-logout");


                }
                else if(data == "logged_out"){
                    $('.fb').text("Log in");
                    $('.fb').attr('id',"fb-login");

                }


            });



        },

        events: {
            'click #save-btn'         : 'saveSettings',
            'click #close-btn'        : 'closeSettings',
            'click #th-btn'           : 'toggleActive',
            'click #th-btn'           : 'toggleActive',
            'click #tw-logout'        : 'logoutTwitter',
            'click #tw-login'         : 'loginTwitter',
            'click #fb-login'         : 'loginFacebook',
            'click #fb-logout'        : 'logoutFacebook',
            'click #nw-btn'           : 'toggleActive',
            'click .bgBtn'            : 'changeBackground'
        },

        changeBackground: function(){

            var btn = $('.bgBtn.active').html();

            console.log("BTN: ",btn);

            this.socket.emit("change-bg",btn)

            


        },

        saveSettings: function(evt){
            if(evt) evt.preventDefault();
            if(this.$("#settings-form").parsley('validate')){
                app.settings.update({
                    zipcode: this.$("#zipcode-input").val() || app.settings.profile.details.zipcode,
                    theme: this.$('#th').val() || app.settings.profile.details.theme,
                    news: this.$('#nw').val() || app.settings.profile.details.news,
                    id: 1
                }, {
                    success: function(mod, res){
                        if(DEBUG) console.log(mod, res);
                    },
                    error: function(mod, res){
                        if(DEBUG) console.log("ERROR", mod, res);
                    }
                });
                this.closeSettings();
                this.trigger('refresh');
            } else {
                // Invalid clientside validations thru parsley
                if(DEBUG) console.log("Did not pass clientside validation");
            }
        },

        toggleActive: function(evt) {
            if (evt.currentTarget.id == "th-btn") {
                this.$("#th-btn.btn.th.active").removeClass('active');
                this.$(evt.currentTarget).toggleClass('active');
            }
            else if (evt.currentTarget.id == "nw-btn") {
                this.$("#nw-btn.btn.nw.active").removeClass('active');
                this.$(evt.currentTarget).toggleClass('active');
            }
        },

        closeSettings: function() {
            this.$("#settingsModal").modal('hide');
        },



        logoutTwitter: function(evt){
                    $('.tw').text("Log in");
                    this.socket.emit("log-out-twitter");
                    window.location ="/"; //Redirect to root path, can change this later


        },

        loginTwitter: function(){

            window.location ="/auth/twitter";


        },


        logoutFacebook: function(evt){
            $('.fb').text("Log in");
            this.socket.emit("log-out-facebook");
            window.location ="/"; //Redirect to root path, can change this later


        },

        loginFacebook: function(){


            // window.location ="/auth/twitter";




        var conf = confirm("Due to security restrictions, you cannot log into facebook through your phone, click ok to log into facebook through your TV.");

        // if(conf == true){
        //     alert("yay");
        //   }
        //   else {
        //     alert("boo");
        //   }


        this.socket.emit('log-in-facebook');



        },


        render: function () {
          this.$el.html(this.template());
          return this;
        }
    });

    return SettingsView;
});
