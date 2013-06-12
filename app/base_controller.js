var locomotive = require('locomotive')
  , passport = require('passport')
  , Controller = locomotive.Controller
  , _ = require('lodash')
  , util = require('util')
   
Controller.extend = require('../lib/misc').extend;
var BaseController = Controller.extend({
    sendSuccess: function (data)
    {
        return this.sendResult(true, data);
        
    },
    status: function(status)
    {
        return Controller.status(status);
    },
    sendError: function (err, otherData)
    {
        var translatedMessages = [];
        if (err)
        {
            var err = _.isArray(err) ? err : [err];
            var self = this;
            err.forEach(function (v)
            {
                translatedMessages.push(self.req.i18n.t(v));
            });
        }
        return this.sendResult(false, _.extend({ messages: translatedMessages }, otherData));
    },
    sendResult: function (success, data)
    {
        this.res.send(_.extend({ success: success }, data));
        return this;
    }
});
module.exports = BaseController;
