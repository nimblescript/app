var locomotive = require('locomotive')
  , passport = require('passport')
  , Controller = require('../base_controller')
  , middleware = require('../../lib/middleware')
  , ViewHelper = require('../../lib/viewhelper')
  , _ = require('lodash')

var UserController = new (Controller.extend({}))();

UserController.createBusinessObject = function (id)
{
    return this.res.locals.nimblescript.business_library.newObject(id || 'user', { initiator_id: this.req.user && this.req.user.username, initiator_type: 'user' });
};

UserController.isfirsttime = ViewHelper.controllerAction({}, function ()
{
    var userBO = this.createBusinessObject();
    var settings = userBO.loadSettings();
    this.sendSuccess({ first_time: !settings.security.password})

});

UserController.firsttime = ViewHelper.controllerAction({}, function ()
{
    var userBO = this.createBusinessObject();
    var settings = userBO.loadSettings();

    var self = this;
    if (settings.security.password)
    {
        this.sendError('user.already_init');
    }
    else
    {
        var errors = userBO.initUser();
        if (errors)
        {
            this.sendError(messages);
            return;
        }

        var password = this.req.param('password');
        var errors = userBO.setPassword(password);
        if (!errors)
        {

            this.sendSuccess();
        }
        else
        {
            var messages = _.map(errors, function (error, key)
            {
                return self.t('settings.setting_names.' + key) + ': ' + self.t(errors[k]);
            });
            this.sendError(messages);
        }
    }
});

UserController.signout = ViewHelper.controllerAction({}, function ()
{
    this.req.logout();
    this.res.end();
});

UserController.signin = ViewHelper.controllerAction({}, function ()
{
    var self = this;
    passport.authenticate('hash', function (err, user)
    {
        if (!user)
        {
            return self.sendError('user.invalid_password');
        }
        self.req.logIn(user, function (err)
{
            return self.sendSuccess();
        });
    })(self.__req, self.__res, self.__next);

});

UserController.current = ViewHelper.controllerAction({}, function ()
{
    this.res.send({ success: true, authenticated: this.req.isAuthenticated() });
});

UserController.getsettings = ViewHelper.controllerAction({}, function ()
{
    var userBO = this.createBusinessObject();
    var settings = userBO.loadSettings();
    this.sendSuccess({ settings: settings});
});
// UserController.before('getsettings', middleware.reqAuthAjax);

UserController.savesettings = ViewHelper.controllerAction({}, function ()
{
    var userBO = this.createBusinessObject();
    var settings = JSON.parse(this.req.param('settings'));
    var toSave = _.omit(settings, 'marketplace', 'security');

    userBO.saveSettings(toSave);
    this.sendSuccess();
});
UserController.before('savesettings', middleware.reqAuthAjax);

module.exports = UserController;
