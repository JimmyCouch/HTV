
var express = require('express'),
    http = require('http'),
    bcrypt = require("bcrypt"),

    // Setup the audio stream decoder, system audio speaker,
    // and the passthrough stream for the audio passed from spotify
    Lame = require('lame'),
    lame = new Lame.Decoder(),
    Speaker = require('speaker'),
    spkr = new Speaker(),

    // Initialize the spotify search engine and the spotify-web
    // interface that will pull track info and streams
    spotify = require('spotify-web'),
    search_spotify = require('spotify'),

    // Load the config file with app settings
    config = require("./config"),

     // Initialize sqlite and create our db if it doesnt exist
    sqlite = require("sqlite3"),
    sqlite3 = require("sqlite3").verbose(),
    db = new sqlite3.Database(__dirname+'/db/hawkeyetv.db'),

    // Other libs
    _ = require("underscore"),
    exec = require('child_process').exec,
    Twit = require('twit'),

    app = express(),
    server = http.createServer(app).listen( process.env.PORT || config.port );

    // Initialize sqlite and create our db if it doesnt exist
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(__dirname+'/db/hawkeyetv.db');
var Twit = require('twit');
var feed = require("feed-read");
var FB = require("fb");

var io = require('socket.io').listen(server);
var views = ['chrome','youtube','settings', 'music', 'facebook', 'twitter', 'news', 'home'];
var ss, stream, omx, ms;
var playback = false;

var passport = require('passport')
    , TwitterStrategy = require('passport-twitter').Strategy
    , FacebookStrategy = require('passport-facebook').Strategy;

    passport.use(new TwitterStrategy({
        consumerKey: config.tw_consumerKey,
        consumerSecret: config.tw_consumerSecret,
        callbackURL: "twitter/callback"
    },
    function(token, tokenSecret, profile, done) {

        db.run("UPDATE profiles SET tw_token = ?, tw_secret =? WHERE id = ?", [ token, tokenSecret, "1" ], function(err){
            if(err) {
                console.log("Failed to load TW oauth token in the database");
            }
        });
        done(null);
    }
));

passport.use(new FacebookStrategy({
    clientID: config.fb_clientID,
    clientSecret: config.fb_clientSecret,
    callbackURL: "/auth/facebook/callback"
},
    function(accessToken, refreshToken, profile, done) {
        console.log("Facebook Token: ", accessToken);
        db.run("UPDATE profiles SET fb_token = ?, fb_refresh =? WHERE id = ?", [ accessToken, refreshToken, "1" ], function(err){
            if(err) {
                console.log("Failed to load FB oauth token in the database");
            }
        });
        done(null);
    }
));

 //Socket.io Server
 io.set('log level', 1);
 io.sockets.on('connection', function (socket) {

    socket.on("screen", function(data) {
        socket.type = "screen";
        ss = socket;
        console.log("Screen ready...");
    });

    socket.on("remote", function(data) {
        socket.type = "remote";
        ms = socket;
        console.log("Remote ready...");
    });

    socket.on("control", function(data) {
        if (views.indexOf(data.action) > -1) {
            console.log("Render: ", data.action );
            ss.emit('controlling', data.action);
        }
    });
    socket.on("change-bg", function(data) {
  
        ss.emit("on-change-bg",data);


    });

    socket.on("refresh", function(data) {
        ss.emit('refresh-control', data);
    });

    socket.on("modal-control", function(data) {
        console.log("modal action: ",data.action);
        console.log("modal data: ",data.data);
        ss.emit('search-bar-control', data);
    });

    socket.on("swipe", function(data) {
        console.log("direction: ",data.direction);
        console.log("distance: ",data.distance);
        ss.emit('swipe-control', data);
    });

    socket.on("toggle-youtube", function(data) {
        ss.emit('youtube-toggle-control', data);
    });

    socket.on("play-youtube", function(data) {
        console.log(data.id);
        var id = data.id,
            url = "http://www.youtube.com/watch?v="+id;

        exec('youtube-dl -i -g --cookies /dev/shm/youtube_cookie.txt ' + url,
            function (error, stdout, stderr) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                } if (stdout != null) {
                  if (omx != null) {
                    console.log("OMX - not NULL");
                      omx.quit();
                      omx = null;
                  }
                  omx = require('omxcontrol');
                  omx.start(stdout.trim());
                  ms.emit('youtube-ctl-btn');
                }
            });
    });

    socket.on("youtube-playback", function(data) {
      if (omx != null) {
        omx.pause();
      }
    });

    socket.on("youtube-stop", function(data) {
      if (omx != null) {
        omx.quit();
        omx = null;
      }
    });

    socket.on("get-rss-feed", function(data) {
        console.log("RSS FEED:",data);

        feed(data, function(err, articles) {
          if (err) throw err;
          ss.emit('rss-control',articles);
          // Each article has the following properties:
          //
          //   * "title"     - The article title (String).
          //   * "author"    - The author's name (String).
          //   * "link"      - The original article link (String).
          //   * "content"   - The HTML content of the article (String).
          //   * "published" - The date that the article was published (Date).
          //   * "feed"      - {name, source, link}
          //
        });
    });

    socket.on("get-facebook-status",function(data){

         db.get("SELECT * FROM profiles WHERE id = ?", [ "1" ], function(err, user){

             var token = user.fb_token;
             var secret = user.fb_refresh;

             if(typeof ms != "undefined"){
                 if(token === null){

                      ms.emit('sent-facebook-status',"logged_out");
                 }
                 else{
                      ms.emit('sent-facebook-status',"logged_in");
                  }
             }
         });
     });
    socket.on("get-twitter-status",function(data){

            db.get("SELECT * FROM profiles WHERE id = ?", [ "1" ], function(err, user){

                console.log("tw-token");
                console.log(user.tw_token);

                var token = user.tw_token;
                var secret = user.tw_secret;

                if(typeof ms != "undefined"){
                    if(token === null){

                         ms.emit('sent-twitter-status',"logged_out");
                    }
                    else{
                         ms.emit('sent-twitter-status',"logged_in");
                     }
                }
            });
        });

     socket.on("log-out-facebook",function(data){

         db.run("UPDATE profiles SET fb_token = ?, fb_refresh =? WHERE id = ?", [ null, null, "1" ], function(err){
             if(err) {
                 console.log("Failed to load TW oauth token in the database");
             }
         });
         ss.emit('log-out-facebook');
         if(typeof ms != "undefined"){
             ms.emit('sent-facebook-status-status',"logged_out");
         }
     });

     socket.on("log-out-twitter",function(data){
         db.run("UPDATE profiles SET tw_token = ?, tw_secret =? WHERE id = ?", [ null, null, "1" ], function(err){
             if(err) {
                 console.log("Failed to load TW oauth token in the database");
             }
         });
         ss.emit('log-out-twitter');
         if(typeof ms != "undefined"){
             ms.emit('sent-twitter-status',"logged_out");
         }
     });

    socket.on("log-in-facebook", function(data) {
            console.log("log in fb");
            ss.emit('ss-log-in-facebook', data);
    });

    socket.on("on-click-facebook", function(data) {
      db.get("SELECT * FROM profiles WHERE id = ?", [ "1" ], function(err, user){
        var token = user.fb_token;
        var secret = user.fb_refresh;

        if(token === null){
          ms.emit('facebook-login');
        } else{
            FB.setAccessToken(token);
            FB.api('/me/home', function(r) {
              ss.emit('sent-facebook-feed',r);
            })
          }
      });
    });

    socket.on("spotify-search", function(data) {
      console.log("Spotify - Search: ", data);
      search_spotify.search({ type: 'track', query: data.query }, function(err, data) {
        if ( err ) {
            console.log('Error occurred: ' + err);
            return;
        } else if ( data.info.num_results == 0 ) {
          ss.broadcast.emit('spotify-null');
        } else {
          tracks = {};
          loop = 5;
          if (data.info.num_results < 6) {
            console.log(data.info.num_results);
            loop = data.info.num_results;
          }
          // NEED to allow results of different sizes
          for (i = 0; i < loop; i++){
            key = i;
            min = parseInt(data.tracks[i].length / 60) % 60;
            sec = Math.floor(data.tracks[i].length % 60);
            tracks[key] = { name: data.tracks[i].name,
              artist: data.tracks[i].artists[0].name,
              href: data.tracks[i].href,
              time: min + ":" + (sec < 10 ? "0"+sec : sec)
            }
          }
          tracks['size'] = loop;
          ss.broadcast.emit('spotify-results', tracks);
        }
        });
    });

    socket.on("spotify-play", function(data) {
      if (stream != null) {
        if (stream._readableState.flowing) {
          console.log("Spotify - Second Play");
          stopSpotify();
        }
        console.log("HERE");
        stream = null;
        spotifyPlay(data);
        ss.broadcast.emit('spotify-reset');
      } else {
        console.log("Spotify - First Play");
        spotifyPlay(data);
      }
    });
    socket.on("spotify-pause", function(data) {
      if (stream != null ){
        if (stream._readableState.flowing) {
          stopSpotify();
          stream.pause();
        } else if (stream._readableState.pipesCount == 0) {
            stopSpotify();
            stream.pause();
        }
      }
    });
    socket.on("spotify-resume", function(data) {
      if (stream != null ){
        if (!stream._readableState.flowing) {
          console.log("Spotify - Resume");
          stream.resume();
          stream
            .pipe(lame)
            .pipe(spkr);
        }
      }
    });

    socket.on("on-click-twitter", function(data) {

        // we need to check if they have a token and token secret
        //if they do have those,  we create an object out of it. We should do this on server start
        //When the user clicks on the twitter button, and there is no object, we redirect them to login
        //if there is an object, we send them data.

        db.get("SELECT * FROM profiles WHERE id = ?", [ "1" ], function(err, user){
            if(user.tw_token === null){
                 ms.emit('twitter-login');
            }
            else{
                var T = new Twit({
                    consumer_key:         config.tw_consumerKey,
                    consumer_secret:      config.tw_consumerSecret,
                    access_token:         user.tw_token,
                    access_token_secret:  user.tw_secret
                });
                T.get('statuses/home_timeline', function (err, reply) {
                       console.log("reply is: ", reply);
                        ss.emit('sent-twitter-feed', reply);
                });
             }
        });
    });
 });

function spotifyPlay(data) {
  spotify.login(config.spotify_name, config.spotify_pass, function (err, spotify) {
    if (err) throw err;
    // first get a "Track" instance from the track URI
    spotify.get(data.track, function (err, track) {
      if (err) throw err;
      stream = track.play();
      stream
        .pipe(lame)
        .pipe(spkr)
        .on('finish', function () {
          spotify.disconnect();
        });
    });
  });
}

function stopSpotify() {
  console.log("Spotify - Stop");
  if ( stream != null ) {
    stream.unpipe(lame);
  }
  if ( lame != null) {
    lame.unpipe(spkr.end());
  }
  spkr, lame = null;
  lame = new Lame.Decoder()
  spkr = new Speaker();
}

// Create our profiles table if it doesn't exist
db.run("CREATE TABLE IF NOT EXISTS profiles (id INTEGER PRIMARY KEY, zipcode TEXT, news TEXT, theme TEXT, tw_token TEXT, tw_secret TEXT, fb_token TEXT, fb_refresh TEXT )");

// Allow node to be run with proxy passing
app.enable('trust proxy');

// Logging config
app.configure('local', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function(){
    app.use(express.errorHandler());
});

// Compression (gzip)
app.use( express.compress() );
app.use( express.methodOverride() );
app.use( express.bodyParser() );            // Needed to parse POST data sent as JSON payload

// Cookie config
//
app.use( express.cookieParser( config.cookieSecret ) );           // populates req.signedCookies
 app.use( express.cookieSession( config.sessionSecret ) );         // populates req.session, needed for CSRF

// We need serverside view templating to initially set the CSRF token in the <head> metadata
// Otherwise, the html could just be served statically from the public directory
app.set('view engine', 'html');
app.set('views', __dirname + '/views' );
app.engine('html', require('hbs').__express);

app.use(express.static(__dirname+'/public'));

app.use( app.router );

app.get("/", function(req, res){
    res.render('index');
});

db.serialize(function(){
    db.get("SELECT * FROM profiles WHERE id = ?", [ "1" ], function(err, profile){
        if(profile){
            console.log("DB has first record");
        } else {
            db.run("INSERT INTO profiles (zipcode, news, theme) VALUES (?,?,?)",
                [ "52242", "disabled", "default"], function(err){
                if(err){
                    console.log(err);
                }
            });
        }
    });
});

app.post("/api/auth/open", function(req, res){
    db.get("SELECT * FROM profiles WHERE id = ?", [ req.body.id ], function(err, profile){
    if(profile){
        res.json({ profile: profile });
    } else {
        res.json({ error: "Default profile" });
    }
    });
});

app.post("/api/auth/update", function(req, res){
    db.serialize(function(){
        db.run("UPDATE profiles SET zipcode = ?, news = ?, theme = ? WHERE id = ?",
            [ req.body.zipcode, req.body.news, req.body.theme, req.body.id ], function(err){
            if(err) {
                console.log("Updating the user failed");
            } else {
                db.get("SELECT * FROM profiles WHERE id = ?", [ req.body.id ], function(err, profile){
                    if(profile){
                        res.json({ profile: profile });
                    } else {
                        res.json({ error: "Default profile" });
                    }
                });
            }
        });
    });
});

app.post("/api/auth/search", function(req, res){
    search_spotify.search({ type: 'track', query: 'under pressure' }, function(err, data) {
    if ( err ) {
        console.log('Error occurred: ' + err);
        return;
    }
        uri = data.tracks[0].href;
        console.log(data.tracks[0].href);
    });
});

app.post("/api/auth/play", function(){
    spotify.login("X", "X", function (err, spotify) {
      if (err) throw err;
      // first get a "Track" instance from the track URI
      spotify.get(uri, function (err, track) {
        if (err) throw err;
        stream = track.play();
        stream
          .pipe(lame)
          .pipe(spkr)
          .on('finish', function () {
            spotify.disconnect();
          });
      });
    });
});

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { successRedirect: '/',
                                     failureRedirect: '/' }));

app.get('/auth/facebook', passport.authenticate('facebook',{scope: 'read_stream'}));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/',
                                     failureRedirect: '/' }));


// Close the db connection on process exit
// (should already happen, but to be safe)
process.on("exit", function(){
    db.close();
});

console.log("STARTUP:: Express server listening on port::", server.address().port, ", environment:: ", app.settings.env);
