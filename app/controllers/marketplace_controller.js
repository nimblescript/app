var locomotive = require('locomotive')
  , Controller = require('../base_controller')
  , _ = require('lodash')
  , middleware = require('../../lib/middleware')
  , ViewHelper = require('../../lib/viewhelper')
  , path = require('path')
  , misc = require('../../lib/misc')

var MarketplaceController = new (Controller.extend({}))();
module.exports = MarketplaceController;

MarketplaceController.createBusinessObject = function (id)
{
    return this.res.locals.nimblescript.business_library.newObject(id || 'marketplace', { initiator_id: this.req.user && this.req.user.account_id, initiator_type: 'account' });
};

MarketplaceController.auth = ViewHelper.controllerAction({}, function ()
{
    var self = this;
    var marketplaceBO = this.createBusinessObject();

    marketplaceBO.authorize(this.req.param('code'), function (err, accessToken)
    {
        this.accesstoken = accessToken;
        self.render();
    });
});
MarketplaceController.before('auth', middleware.reqAuth);

MarketplaceController.authStatus = ViewHelper.controllerAction({}, function ()
{
    var self = this;
    var marketplaceBO = this.createBusinessObject();

    marketplaceBO.checkAuthorization(function (err, response)
    {
        if (err)
            self.sendError(err);
        else
            self.sendSuccess({ valid: response.valid});
    });
});
MarketplaceController.before('authStatus', middleware.reqAuthAjax);

MarketplaceController.itemInfo = ViewHelper.controllerAction({}, function ()
{
    var id = getId(this.req);

    var self = this;
    var marketplaceBO = this.createBusinessObject();

    var settings = {};
    if (this.req.param('c')) settings.complete = true;

    marketplaceBO.getItemInfo(id, settings,
        function (err, item)
        {
            if (_.isObject(err))
                err = 'marketplace.unknown_error';
            err ? self.sendError(err) : self.sendSuccess(item);
        });
});
MarketplaceController.before('itemInfo', middleware.reqAuthAjax);

MarketplaceController.itemInstall = ViewHelper.controllerAction({}, function ()
{
    var self = this;
    var marketplaceBO = this.createBusinessObject();
    var options = {
        platform: this.req.param('platform'),
        destfilepath: this.req.param('destfilepath')
    };

    marketplaceBO.installItem(this.req.param('id'), options, function (err, response)
    {
        if (_.isObject(err))
            err = 'marketplace.unknown_error';
        err ? self.sendError(err) : self.sendSuccess(response);
    });
});
MarketplaceController.before('itemInstall', middleware.reqAuthAjax);

function getId(req)
{
    var id;
    if (req.param('ic'))
        id = { ic: req.param('id') };
    else if (req.param('r'))
        id = { rid: req.param('id') };
    else
        id = { iid: req.param('id') };
    return id;
}

MarketplaceController.publishers = ViewHelper.controllerAction({}, function ()
{
    var self = this;
    var marketplaceBO = this.createBusinessObject();
    marketplaceBO.getPublishers({}, function (err, response)
    {
        err ? self.sendError(err) : self.sendSuccess(response);
    });
});
MarketplaceController.before('publishers', middleware.reqAuthAjax);

MarketplaceController.itemPublish = ViewHelper.controllerAction({}, function ()
{
    
    var data = this.req.param('data');
    if (!_.isObject(data))
    {
        this.sendError('system.invalid_data');
        return;
    }

    var self = this;
    var marketplaceBO = this.createBusinessObject();
    marketplaceBO.publishItem(data, function (err, response)
    {
        // @@TODO Tidy up with consistent response/result reporting
        if (err)
        {
            if (_.isObject(err))
            {
                if (err.validation)
                    self.sendError('marketplace.publish.validation_error', err);
                else
                    self.sendError('system.unknown_error', err);
            }
            else
                self.sendError(err);
        }
        else
        {
            self.sendSuccess({ item_id: response.item_id, item_release_id: response.item_release_id });
        }
    });
});
MarketplaceController.before('itemPublish', middleware.reqAuthAjax);

MarketplaceController.publisherItems = ViewHelper.controllerAction({}, function ()
{
    var id = this.req.param('id');

    var self = this;
    var marketplaceBO = this.createBusinessObject();
    marketplaceBO.getPublisherItems(id,function (err, response)
    {
        err ? self.sendError(err) : self.sendSuccess(response);
    });
});
MarketplaceController.before('publishers', middleware.reqAuthAjax);

MarketplaceController.categories = ViewHelper.controllerAction({}, function ()
{
    var self = this;
    var marketplaceBO = this.createBusinessObject();
    marketplaceBO.getCategories({}, function (err, response)
    {
        err ? self.sendError(err) : self.sendSuccess(response);
    });
});
MarketplaceController.before('categories', middleware.reqAuthAjax);

MarketplaceController.licenses = ViewHelper.controllerAction({}, function ()
{
    var self = this;
    var marketplaceBO = this.createBusinessObject();
    marketplaceBO.getLicenses({}, function (err, response)
    {
        err ? self.sendError(err) : self.sendSuccess(response);
    });
});
MarketplaceController.before('licenses', middleware.reqAuthAjax);

