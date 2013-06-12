var locomotive = require('locomotive')
  , Controller = require('../base_controller')
  , _ = require('lodash')
  , middleware = require('../../lib/middleware')
  , ViewHelper = require('../../lib/viewhelper')
  , path = require('path')
  , misc = require('../../lib/misc')

var FavoritesController = new (Controller.extend({}))();
module.exports = FavoritesController;

FavoritesController.createBusinessObject = function(id)
{
    return this.res.locals.nimblescript.business_library.newObject(id || 'favorites', { initiator_id: this.req.user && this.req.user.account_id, initiator_type: 'account' });
};

FavoritesController.search = ViewHelper.controllerAction({}, function ()
{
    var favoritesBO = this.createBusinessObject();
    var self = this;
    favoritesBO.search({ filter: this.req.param('filter') && JSON.parse(this.req.param('filter')) }, function (err, favoritesList)
    {
        err ? self.sendError(err) : self.sendSuccess({ items: favoritesList});
    });
});
FavoritesController.before('search', middleware.reqAuthAjax);

FavoritesController.get = ViewHelper.controllerAction({}, function ()
{
    var favoritesBO = this.createBusinessObject();
    var self = this;
    favoritesBO.get(this.param('id'), function (err, data)
    {
        err ? self.sendError(err) : self.sendSuccess({ favorite: data });
    });
});
FavoritesController.before('get', middleware.reqAuthAjax);

FavoritesController.del = ViewHelper.controllerAction({}, function ()
{
    var favoritesBO = this.createBusinessObject();
    var self = this;
    favoritesBO.del(this.param('id'), function (err)
    {
        err ? self.sendError(err) : self.sendSuccess();
    });
});
FavoritesController.before('del', middleware.reqAuthAjax);

FavoritesController.save = ViewHelper.controllerAction({}, function ()
{
    var favoritesBO = this.createBusinessObject();
    var self = this;
    favoritesBO.save(this.param('id'), JSON.parse(this.req.body.favorite), function (err)
    {
        err ? self.sendError(err) : self.sendSuccess();
    });
});
FavoritesController.before('save', middleware.reqAuthAjax);

FavoritesController.rename = ViewHelper.controllerAction({}, function ()
{
    var favoritesBO = this.createBusinessObject();
    var self = this;
    favoritesBO.rename(this.param('id'), this.param('newname'), function (err)
    {
        err ? self.sendError(err) : self.sendSuccess();
    });
});
FavoritesController.before('rename', middleware.reqAuthAjax);

module.exports = FavoritesController;
