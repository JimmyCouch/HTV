define([
    "app",
    "models/ProfileModel",
    "utils"
], function(app, ProfileModel){

    var SettingsModel = Backbone.Model.extend({

        initialize: function(){
            _.bindAll(this);

            this.profile = new ProfileModel();
            this.openProfile({id: "1"});
        },

        url: function(){
            return app.API + '/auth';
        },

        setProfile: function(res) { 
            this.profile.setDetails(res.profile);
        },

        post: function(opts, callback, args){
            var _this = this;
            $.ajax({
                url: this.url() + '/' + opts.method,
                contentType: 'application/json',
                dataType: 'json',
                type: 'POST',
                data:  JSON.stringify( _.omit(opts, 'method') ),
                success: function(res){
                    console.log("Settings Saved");
                    _this.setProfile(res);
                }, error: function(res) {
                    console.log("Save Failed");
                },
            });
        },

        update: function(opts, callback, args){
            this.post(_.extend(opts, { method: 'update' }), callback);
        },

        openProfile: function(opts, callback, args){
            this.post(_.extend(opts, { method: "open"}), callback);
        }

    });
    
    return SettingsModel;
});