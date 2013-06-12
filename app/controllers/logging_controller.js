var locomotive = require('locomotive')
  , passport = require('passport')
  , Controller = locomotive.Controller
  , _ = require('lodash')
  , middleware = require('../../lib/middleware')
  , ViewHelper = require('../../lib/viewhelper')
    
var ActivityController = new Controller();

ActivityController.createBusinessObject = function(id)
{
    return this.res.locals.snackle.business_library.newObject(id, { initiator_id: this.req.user.account_id, initiator_type: 'account' });
};

ActivityController.get = ViewHelper.controllerAction({}, function ()
{
    var eventsBO = this.createBusinessObject('events');
    this.res.send([
        {
            created_at: new Date(),
        },
        {
            created_at: new Date(),
        }
        ]
    );
});
ActivityController.before('get', middleware.reqAuthAjax);


module.exports = ActivityController;
