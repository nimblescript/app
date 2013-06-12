define(function (require, exports, module)
{
    "use strict"

    module.exports = function (register)
    {
        var _ = require('underscore')
            , $ = require('jquery')
            , Backbone = require('backbone')
            , App = require('App')
            , Logger = require('logger')
            , KeyboardShortcuts = require('keyboardshortcuts')
            , Document = require('document')
            , T = require('translate')
            , QueryString = require('helpers/QueryString')
            

        init();

        register(
            {
                id: 'xemware.nimblescript.plugin.marketplace',
                about: function ()
                {
                    return "Adds Marketplace functionality"
                },
                version: function ()
                {
                    return "0.0.1"
                }
            }
        );

        var repositoryManager = App.request('repository:getmanager');
        var settingsManager = App.request('settings:getmanager');

        var PLATFORM_RULES = [
        { platform: 'win32', arch: 'ia32', supports: ['win32','win',''] },
        { platform: 'win32', arch: 'x64', supports: ['win64','win',''] },
        { platform: 'linux', arch: 'ia32', supports: ['linux32','linux',''] },
        { platform: 'linux', arch: 'x64', supports: ['linux32','linux',''] },
        { platform: 'darwin', arch: 'ia32', supports: ['mac32','mac',''] },
        { platform: 'darwin', arch: 'x64', supports: ['mac64','mac',''] }
        ]

        var ID_TYPE_SHORT_CODES = {
            'install_code': 'ic',
            'item_id': 'iid',
            'item_release_id': 'rid'
        };

        function MarketplaceManager()
        {
            this._publisherItemsCache = {};
        }

        _.extend(MarketplaceManager.prototype, Backbone.Events,
            {
                search: function (options)
                {
                    var self = this;
                    options = _.defaults({}, options, { repository: 'local' });
                    return App.serverCommand(
                        {
                            url: '/filelists',
                            data: { rep: options.repository },
                            success: function (response)
                            {
                                var lists = self.cache[options.repository] = _.map(response.filelists, function (name)
                                {
                                    return { name: name };
                                });
                                options.callback && options.callback(null, lists);

                            },
                            error: function ()
                            {
                                options.callback && options.callback(arguments);
                            }
                        })
                },
                isAuthorized: function ()
                {
                    var settingsManager = App.request('settings:getmanager');
                    return !_.isEmpty(settingsManager.get('marketplace.access_token'));
                },
                checkAuthorization: function(callback)
                {
                    if (!this.isAuthorized())
                        callback(null, false);
                    else
                    {
                        App.serverCommand('marketplace/authstatus', function (err, response)
                        {
                            callback && callback(err, response && response.valid);
                        })
                    }
                },
                authorize: function (callback)
                {
                    var self = this;
                    var settingsManager = App.request('settings:getmanager');
                    require(['modalhelper'], function (ModalHelper)
                    {
                        new ModalHelper().confirm({
                            title: T.t('marketplace.authorize_title'), text: T.t('marketplace.authorize_page'),
                            onButton: function (text)
                            {
                                if (text == 'Yes')
                                {
                                    var path = settingsManager.get('marketplace.url') + '/oauth/authorize?client_id=' + settingsManager.get('marketplace.client_id')
                                        + '&redirect_uri=' + encodeURIComponent(location.protocol + '//' + location.host + '/marketplace/auth?install=1');

                                    window.marketplaceAuthDone = function (accessToken)
                                    {
                                        if (!_.isEmpty(accessToken))
                                        {
                                            settingsManager.loadSettings(function ()
                                            {
                                                callback && callback(true);
                                            });
                                        }
                                        else
                                            callback && callback(false);

                                    }
                                    window.open(path, 'nsmarketplaceauth', 'location=0,status=0,width=800,height=400');
                                }
                                else
                                    callback && callback(false)

                            }
                        })
                    });
                },
                publishScript: function(scriptItem, callback)
                {

                },
                getLicenses: function(options,callback)
                {
                    var self = this;
                    _.isFunction(options) && (callback = options, options = {});
                    _.isObject(options) || (options = {});

                    if (options.noCache || !this._licensesCache)
                    {
                        return App.serverCommand('marketplace/licenses', function (err, response)
                        {
                            response && (self._licensesCache = response.licenses);
                            callback && callback(err || !response.success && response.messages, self._licensesCache);
                        })
                    }
                    else
                        callback && callback(null, this._licensesCache);

                },
                getCategories: function(options,callback)
                {
                    var self = this;
                    _.isFunction(options) && (callback = options, options = {});
                    _.isObject(options) || (options = {});
                    if (options.noCache || !this._categoriesCache)
                    {
                        return App.serverCommand('marketplace/categories', function (err, response)
                        {
                            response && (self._categoriesCache = response.categories);
                            callback && callback(err || !response.success && response.messages,self._categoriesCache);
                        })
                    }
                    else
                        callback && callback(null, this._categoriesCache);

                },
                getPublishers: function(options,callback)
                {
                    var self = this;
                    _.isFunction(options) && (callback = options, options = {});
                    _.isObject(options) || (options = {});
                    if (options.noCache || !this._publishersCache)
                    {
                        return App.serverCommand('marketplace/publishers', function (err, response)
                        {
                            response && (self._publishersCache = response.publishers);
                            callback && callback(err || !response.success && response.messages, self._publishersCache);
                        })
                    }
                    else
                        callback && callback(null,this._publishersCache)
                },
                getPublisherItems: function(publisherId,options,callback)
                {
                    var self = this;
                    _.isFunction(options) && (callback = options, options = {});
                    _.isObject(options) || (options = {});
                    if (options.noCache || !this._publisherItemsCache[publisherId])
                    {
                        return App.serverCommand('marketplace/publisher/' + encodeURIComponent(publisherId) + '/items', function (err, response)
                        {
                            response && (self._publisherItemsCache[publisherId] = response.items);
                            callback && callback(err || !response.success && response.messages, self._publisherItemsCache[publisherId]);
                        })
                    }
                    else
                        callback && callback(null, this._publisherItemsCache[publisherId])

                },
                getItemInfo: function (idType,id, options,callback)
                {
                    if (_.isEmpty(id))
                        return callback && callback(T.t('system.invalid_data'));

                    _.isFunction(options) && (callback = options, options = {});
                    _.isObject(options) || (options = {});

                    var qsOptions = { c: options.complete };
                    qsOptions[ID_TYPE_SHORT_CODES[idType]] = 1;

                    var command = 'marketplace/item/' + encodeURIComponent(id) + '/info?' +
                        QueryString.stringify(qsOptions);
                    return App.serverCommand(command, callback);

                },
                publishItem: function(data, options, callback)
                {
                    var self = this;
                    _.isFunction(options) && (callback = options, options = {});
                    _.isObject(options) || (options = {});

                    return App.serverCommand({
                        url: 'marketplace/publish/item',
                        data: { data: data },
                        type: 'POST',
                        success: function (response)
                        {
                            callback && callback(null, response)
                        },
                        error: function ()
                        {
                            callback && callback(arguments);
                        }

                    })
                },
                installItem: function(installCode, options, callback)
                {
                    return App.serverCommand(
                        {
                            url: 'marketplace/item/' + encodeURIComponent(installCode) + '/install',
                            data: options,
                            type: 'POST',
                            success: function (response)
                            {
                                if (_.result(response, 'success'))
                                {
                                    switch( response.item_type)
                                    {
                                        case 'script':
                                            repositoryManager.externalItemAction('saved', response.install_path, 'script');
                                            callback && callback(null, response)
                                            break;
                                        case 'module':
                                            if (options.enable)
                                            {
                                                var s = {};
                                                s['modules.' + response.module.id + '.enabled'] = true;
                                                settingsManager.set(s, function ()
                                                {
                                                    callback && callback(null, response);
                                                });
                                            }
                                            break;
                                    }
                                }
                                else
                                    callback && callback(null, response)
                            },
                            error: function ()
                            {
                                callback && callback(arguments);
                            }
                        })

                },
                itemPublicUrl: function(id)
                {
                    return this.marketplaceUrl('item', { item_id: id });
                },
                marketplaceUrl: function(id,options)
                {
                    var url = App.request('settings:getmanager').get('marketplace.url');
                    switch (id)
                    {
                        case 'account':
                            return url + '/account';
                        case 'item_public':
                            return url + '/item/' + options.item_id;
                        case 'item_release_public':
                            return url + '/item/' + options.item_id + '/release/' + options.item_release_id;
                        case 'item_release_admin':
                            return url + '/admin/item/' + options.item_id + '/release/' + options.item_release_id + '/home';
                    }
                },
                quickInstallModal: function ()
                {
                    quickInstallModal();
                },
                suitablePlatform: function (platforms)
                {
                    var platformRule = _.find(PLATFORM_RULES, _.pick(App.appInfo(), 'platform','arch'));
                    if (platformRule)
                        return firstOf(platforms, platformRule.supports);

                    function firstOf(platforms, supports)
                    {
                        return _.find(supports, function (supportedPlatform)
                        {
                            if (_.indexOf(platforms, supportedPlatform) >= 0)
                                return true;
                        });

                    }
                }
            })

        var marketplaceManager = new MarketplaceManager();

        function init()
        {
            App.reqres.setHandler('marketplace:getmanager', function ()
            {
                return marketplaceManager;
            })
            addToMenu();

        }


        function addToMenu()
        {
            var menuManager = App.request('menu:getmanager');
            var editMenu = _.first(menuManager.collection.where({ id: 'edit' }));
            var editPosition = menuManager.collection.models.indexOf(editMenu);
            menuManager.collection.add([{
                id: 'marketplace',
                label: 'Marketplace',
                href: '#',
                subitems: new Backbone.Collection([{
                    id: 'marketplace.browse',
                    label: 'Browse',
                    href: '#',
                    shortcut: 'Ctrl-Alt-M',
                    command: 'marketplace:browse',
                    disabled: true
                },
                {
                    id: 'marketplace.install',
                    label: 'Quick Install',
                    href: '#',
                    shortcut: 'Ctrl-Alt-I',
                    command: 'marketplace:install'
                }])
            }], { at: editPosition + 1 });

            KeyboardShortcuts.bind('ctrl+alt+i', function (e)
            {
                KeyboardShortcuts.preventDefault(e);
                quickInstallModal();
            })
            KeyboardShortcuts.bind('ctrl+alt+m', function (e)
            {
                KeyboardShortcuts.preventDefault(e);
                newBrowserDocument();
            })

            App.commands.setHandler('marketplace:browse', function ()
            {
                newBrowserDocument();
            });

            App.commands.setHandler('marketplace:install', function ()
            {
                quickInstallModal();
            });

        }

        function newBrowserDocument()
        {
            var documentManager = App.request('documents:getmanager');
            documentManager.addDocument(new BrowserDocument({ marketplaceManager: marketplaceManager } ));
        }

        function quickInstallModal()
        {

            require(['./InstallView', 'modalhelper'], function (MarketplaceInstallView,ModalHelper)
            {
                App.request('modules:getmanager').installedModules(function (modules)
                {
                    var userSettings = App.request('settings:getmanager').lastUserSettings;
                    var view = new MarketplaceInstallView({
                        marketplaceManager: marketplaceManager,
                        installedModules: _.map(modules, function(module)
                        {
                            return module.id
                        }),
                        userModules: userSettings.modules,
                        marketplace: _.pick(userSettings.marketplace, 'url')
                    });
                    
                    var modalHelper = new ModalHelper();
                    modalHelper.view({
                        focusOn: 'input',
                        buttons: [{ text: 'Close', defaultButton: true }],
                        title: 'Install from Marketplace',
                        view: view,
                        width: 600,
                        height: 400
                    });

                    view.listenTo(view, 'finished', function (err, installerData)
                    {
                        modalHelper.close();
                    })


                });
                
            });
        }

        var BrowserDocument = Document.extend(
            {
                constructor: function (options)
                {
                    _.bindAll(this);
                    Document.prototype.constructor.apply(this, arguments);
                    this.options = options || {};
                },
                title: 'Marketplace Browser',
                documentType: 'xemware.document.marketplace.browser',
                renderContent: function (callback)
                {
                    var settingsManager = App.request('settings:getmanager');
                    var self = this;
                    require(['./MarketplaceBrowserView'], function (MarketplaceBrowserView)
                    {
                        self.view = new MarketplaceBrowserView(this.options);
                        callback(self.view.render().$el)
                    })
                }
            })

    }
}
);