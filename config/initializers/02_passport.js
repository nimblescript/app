var passport = require('passport');
var HashStrategy = require('passport-hash').Strategy;
var logger = require('../../lib/logger');
var snackleViewHelper = require('../../lib/viewhelper');
var _ = require('lodash');

logger.debug('Intializing: passport')
// Use the LocalStrategy within Passport.

passport.use(new HashStrategy({
    hashParam: 'password',
    passReqToCallback: true
},
function (req, password, done)
{
    var userBO = req.res.locals.nimblescript.business_library.newObject('user') //, { initiator_id: req.user.account_id, initiator_type: 'account' });
    var settings;
    if (userBO.verifyPassword(password))
{
        settings = userBO.loadSettings();
        return done(null, settings);
    }
    else
        return done(null, null);
    
}
));

// Passport session setup.

passport.serializeUser(function (settings, done, req)
{
    done(null, 'user');
});

passport.deserializeUser(function (id, done, req)
{
    var userBO = req.res.locals.nimblescript.business_library.newObject('user') //, { initiator_id: req.user.account_id, initiator_type: 'account' });
    var settings = userBO.loadSettings();
    _.extend(settings, { username: id });
    done(null, settings);
});

logger.debug('Intialized: passport');
