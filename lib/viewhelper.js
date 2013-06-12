/*  */
var logger = require('./logger')
    , _ = require('lodash')
    , misc = require('./misc')
    , config = require('nimblescript-config')

var INJECTION_LOCATION = {
        top_before: 'top_before',
        top_after: 'top_after',
        bottom_before: 'bottom_before',
        bottom_after: 'bottom_after'
}

var RESOURCE_TYPE = {
    script: 'script',
    meta: 'meta',
    stylesheet: 'stylesheet'
}

/**
 * `ViewHelperError` error.
 *
 * @api private
 */
function ViewHelperError(message) {
    Error.call(this);
    Error.captureStackTrace(this, arguments.callee);
    this.name = 'ScriptError';
    this.message = message;
};
ViewHelperError.prototype.__proto__ = Error.prototype;

function Resource(resourceType, options)
{
    this.resource_type = resourceType;
}

function Script(options)
{
    Resource.call(this, RESOURCE_TYPE.script);
    _.defaults(this, options, { type: 'text/javascript', injection_location: INJECTION_LOCATION.bottom_after /*, src: null, content: null */});
    if (!this.src && !this.content)
        throw new ViewHelperError('You must specify either src or content');
}
Script.prototype = {
}
misc.inherit(Resource, Script);

function StyleSheet(options)
{
    Resource.call(this, RESOURCE_TYPE.stylesheet);
    _.defaults(this, options, { injection_location: INJECTION_LOCATION.top_after /*, href: null, content: null */ });
    if (!this.href && !this.content)
        throw new ViewHelperError('You must specify either href or content');
}
StyleSheet.prototype = {
}
misc.inherit(Resource, Meta);

function Meta(options)
{
    Resource.call(this, RESOURCE_TYPE.meta);
    _.defaults(this, options, { injection_location: INJECTION_LOCATION.top_after /*, name: null, content: null */ });
    if (!this.name)
        throw new ViewHelperError('You must specify name');
}
Meta.prototype = {
}
misc.inherit(Resource, Meta);

function ResourceManager(options)
{
    this.resources = [];
}
ResourceManager.prototype =
{
    resourcesAtLocation: function (location)
    {
        return this.resources.filter(function (v)
        {
            return v.injection_location == location;
        });
    }
}

/* Hacks for SWIG template library until it supports functions with tags */
Object.defineProperties(ResourceManager.prototype, 
    {
        "resourcesBottomAfter": {
            get: function()
            {
                return this.resourcesAtLocation(INJECTION_LOCATION.bottom_after);                
            }
        },
        "resourcesBottomBefore": {
            get: function ()
            {
                return this.resourcesAtLocation(INJECTION_LOCATION.bottom_before);
            }
        },
        "resourcesTopBefore": {
            get: function()
            {
                return this.resourcesAtLocation(INJECTION_LOCATION.top_before);                
            }
        },
        "resourcesTopAfter": {
            get: function ()
            {
                return this.resourcesAtLocation(INJECTION_LOCATION.top_after);
            }
        },

    }
);

function Menu(options)
{
    this.menuItems = {};
}
Menu.prototype = {
};

function MenuItem(options)
{
    _.defaults(this, options, { title: 'Undefined', id: '', url: '#' });
}
MenuItem.prototype = {
};

function ViewHelper(options)
{
    this.resourceManager = new ResourceManager(options);
    this.locals = {};
    this.menus = _menus;
}


ViewHelper.prototype = {
    render: function (controller, options)
    {
        var opts = _.defaults({}, options, {});
        _.extend(controller, this.locals,
            {
                resource_manager: this.resourceManager,
                main_menu: (opts.menu_name && _menus[opts.menu_name]) || _menus['default'],
                route: controller.route
            });
        controller._render.call(controller,options);
    },
}


module.exports = ViewHelper;
module.exports.middleware = function(options)
{
    return function (req, res, next)
    {
        res.locals.viewHelper = new ViewHelper(options);
        next();
    }
            
}

/**
 * Wrap a controller action function 
 *
 * Examples:
 *
 *   ViewHelper.controllerAction({}, function() { } );
 *
 * @param {Object} options
 * @param {Function} function
 * @return {Function}
 * @api public
 */
module.exports.controllerAction = function (options, func)
{
    return function()
    {
        logger.debug('Entered \'' + this.route.controller + '#' + this.route.action + '\'');
        this.i18n = this.req.i18n;
        this.t = this.req.i18n.t;
        this._render = this.render;
        this.render = this.res.locals.viewHelper.render.bind(this.res.locals.viewHelper, this);
        try
        {
            func.call(this);
        }
        catch (err)
        {
            logger.error('Exception in \'' + this.route.controller + '#' + this.route.action + '\'');
            logger.error(err.stack);
        }
        logger.debug('Exiting \'' + this.route.controller + '#' + this.route.action + '\'');
    }
};

_menus = {};

module.exports.Script = Script;
module.exports.Meta = Meta;
module.exports.MenuItem = MenuItem;
module.exports.Menus = _menus;
module.exports.INJECTION_LOCATION = INJECTION_LOCATION;