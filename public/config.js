
if (typeof DEBUG === 'undefined') DEBUG = true;

require.config({

    baseUrl: '/',
    waitSeconds: 200,
    paths: {
        'util'                : 'assets/lib/util',
        'jquery'              : 'assets/lib/jquery',
        'underscore'          : 'assets/lib/underscore',         
        'backbone'            : 'assets/lib/backbone',
        'bootstrap'           : 'assets/vendor/bootstrap/js/bootstrap',
        'text'                : 'assets/lib/text',
        'parsley'             : 'assets/lib/parsley',
        'socket'              : 'socket.io/socket.io',
        'Mustache'            : 'assets/lib/mustache',
        'touchswipe'          : 'assets/lib/jquery.touchSwipe',
        'yt'                  : 'assets/lib/yt',
        'jsapi'               : 'assets/lib/jsapi',
        'scrollTo'            : 'assets/lib/jquery.scrollTo'
    },

    shim: {
        'underscore'          : { exports  : '_' },
        'backbone'            : { deps : ['underscore', 'jquery'], exports : 'Backbone' },
        'bootstrap'           : { deps : ['jquery'], exports : 'Bootstrap' },
        'parsley'             : { deps: ['jquery'] },
        'socket'              : { deps : ['underscore', 'jquery'], exports : 'socket' }
    }

});

require(['main']);
