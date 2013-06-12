var express = require('express')
	, passport = require('passport')
	, helpers = require('../../lib/helpers')
	, staticAsset = require('static-asset')
    , locomotive = require('locomotive')
    , os = require('os')
    , consolidate = require('consolidate')
    , swig = require('swig')
    , userAgent = require('express-useragent')
    , config = require('nimblescript-config')
    , logger = require('../../lib/logger')
    , viewHelper = require('../../lib/viewhelper')
    , flashify = require('flashify')
    , i18n = require('i18next')
    , path = require('path')

var BusinessLibrary = require(config.get('business-library:module'));
// var RepositoryLibrary = require(config.get('repository-library:module'));
// var repositoryLibraryInstance = new RepositoryLibrary.constructor();
// BusinessLibrary.repositoryLibrary = repositoryLibraryInstance;

i18n.init({
    resGetPath: "locales/__lng__/__ns__.json",
    fallbackLng: 'en',
    debug: true
});

module.exports = function ()
{
    this.locals.nimblescript = {
        business_libary: BusinessLibrary
        // ,repository_library: repositoryLibraryInstance
    }
    this.set('views', __dirname + '/../../app/views');
    this.engine('swig', consolidate.swig);
    this.set('view engine', 'swig');
    swig.init({
        root: __dirname + '/../../app/views',
        allowErrors: true,
        cache: false
    });
    // this.use(express.logger());
    this.use(express.compress());
    this.use(express.cookieParser());
    this.use(express.bodyParser());
    this.use(express.methodOverride());
    
    this.use(express.favicon(__dirname + '/../../public/assets/ico/favicon.ico'));
    // var store = express.session.MemoryStore({ reapInterval: 600000 });
    this.use(express.cookieSession({ secret: 'nimblescript', cookie: { maxAge: 123467654456 } }));
    /*
    if (config.get('webServer:session_store:enabled'))
    {

        var storeProvider = require(config.get('webServer:session_store:module'))(express);
        store = new storeProvider({ url: config.get('webServer:session_store:options:url') });
    }
    this.use(express.session({
        secret: 'STORE_SECRET',
        store: store
    }));
    */

    this.use(staticAsset(__dirname + '/../../public'));
    this.use(express.static(__dirname + '/../../public', { maxAge: 123467654456 }));
    this.use(userAgent.express());
    this.use(logger.express());
    this.use(BusinessLibrary.express());
    // this.use(RepositoryLibrary.express());
    this.use(i18n.handle);
    i18n.serveClientScript(this.express)      // grab i18next.js in browser
      .serveDynamicResources(this.express)    // route which returns all resources in on response

    this.use(viewHelper.middleware());
    this.use(passport.initialize());
    this.use(passport.session());
    this.use(flashify);
    this.use(this.router);
    this.dynamicHelper(helpers.dynamic);

    this.use(function (req, res, next)
    {
        logger.debug('Invalid url: ' + req.url);
        res.redirect('/404');
    });

    // Bubbled error handler
    this.use(function (err, req, res, next)
    {
        logger.error('Uncaught error in middleware' + os.EOL + err.stack);
        res.redirect('/404');
    });

}
