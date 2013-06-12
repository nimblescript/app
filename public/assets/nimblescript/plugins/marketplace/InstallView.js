define(['marionette', 'backbone', 'underscore', 'swig', 'Vent', 'jquery', 'App', 'text!./install.html', './ItemDetailsView', 'modalhelper',
    'cookie', 'translate', './Installer', 'async'],
    function (Marionette, Backbone, _, Swig, Vent, $, App, html, ItemDetailsView, ModalHelper, Cookie, T, Installer, Async)
    {
        "use strict";

        var WAITING_TEXT = null // T.t('misc.please_wait') + '...';

        return Marionette.Layout.extend({
            constructor: function ()
            {
                _.bindAll(this);
                Marionette.Layout.prototype.constructor.apply(this, arguments);
            },
            template: Swig.compile(html),
            className: 'marketplace-install',
            initialize: function ()
            {
                this._marketplaceManager = this.options.marketplaceManager;
                this._detailsView = new ItemDetailsView({
                    model: new Backbone.Model({
                        enabled_modules: _.filter(_.map(this.options.userModules, function (value, key)
                        { return value.enabled ? key : null }), function (value) { return value !== null }),
                        installed_modules: this.options.installedModules,
                        marketplace: this.options.marketplace,
                        item: false
                    })
                })
                this._itemTypeHandlers = { script: this.installScript, module: this.installModule };
            },
            events:
                {
                    'click button.search': function (e) { this.search() },
                    'click button.install': function (e) { this.install() },
                    'keyup input': function (e) { if (e.keyCode == 13) this.search(); }
                },
            ui: {
                installCode: '.install-code',
                searchButton: 'button.search',
                installButton: 'button.install',
                errorMessage: 'div.error'
            },
            regions:
                {
                    itemDetails: '.item-details'
                },
            onRender: function ()
            {
                this.itemDetails.show(this._detailsView);
            },
            search: function (code, install)
            {
                var self = this;
                if (_.isEmpty(code))
                    code = this.ui.installCode.val();

                if (_.isEmpty(code))
                    return;

                Async.waterfall([
                    function authorized(cb)
                    {
                        self._marketplaceManager.checkAuthorization(function (err, authorized)
                        {
                            if (!authorized)
                            {
                                self._marketplaceManager.authorize(function (authorized)
                                {
                                    cb(!authorized && T.t('marketplace.authorization_error'));
                                });
                            }
                            else
                                cb();
                        });
                    },
                    function doSearch(cb)
                    {
                        self.ui.searchButton.buttonDisable(WAITING_TEXT);
                        self.ui.installButton.hide();
                        self._marketplaceManager.getItemInfo('install_code', code, function (err, response)
                        {
                            self.ui.searchButton.buttonEnable();
                            var allowInstall = !err && response.success;

                            self._currentItem = _.result(response, 'data') || false;

                            if (self._currentItem)
                            {
                                switch (self._currentItem.item_type)
                                {
                                    case 'script':
                                        _.each(self._currentItem.script.required_modules, function (requiredModule)
                                        {
                                            if (!requiredModule.invalid)
                                                requiredModule.install_platform = self.determineInstallPlatform(requiredModule);
                                        });
                                        break;
                                    case 'module':
                                        self._currentItem.module.install_platform = self.determineInstallPlatform(self._currentItem.module);
                                        if (!self._currentItem.module.install_platform)
                                            allowInstall = false;
                                        break;
                                }
                            }
                            if (allowInstall)
                                self.ui.installButton.show();
                            self._detailsView.model.set('item', self._currentItem);
                            if (_.isArguments(err))
                                err = T.t('system.ajax_error');
                            cb(err || (response && response.messages && response.messages.join(';') ) || null);
                        });
                    }
                    ],
                    function complete(err)
                    {
                        if (err)
                            self.ui.errorMessage.text(err);
                    });
            },
            install: function ()
            {
                this._itemTypeHandlers[this._currentItem.item_type]();
            },
            installScript: function ()
            {
                var self = this;

                App.execute('components:get', ['xemware.nimblescript.component.repositoryexplorer'], function (err, Components)
                {
                    var modal = Components[0].showModal({
                        mode: 'save', overwritePrompt: true,
                        title: 'Save script to...',
                        initialFilename: self._currentItem.name + '.ns',
                        initialPath: Cookie.get('ns-last-install-path'),
                        onOK: function (selectedItems, callback)
                        {
                            // Close modal
                            callback(true);

                            Cookie.set('ns-last-install-path', modal.getDirectory(), { expires: 365 });
                            var modulesToAction = self._detailsView.modulesToAction();
                            var toAction = [{
                                type: 'script', action: 'install', code: self._currentItem.install_code, name: self._currentItem.name,
                                destfilepath: modal.getDirectory() + '/' + modal.getFilename()
                            }];
                            _.forOwn(modulesToAction, function (settings, key)
                            {
                                toAction.push({ type: 'module', action: settings.action, module_id: key, code: settings.install_code, platform: settings.platform });
                            });
                            new Installer(toAction).install(self.onInstall);

                        }
                    });
                });
            },
            determineInstallPlatform: function (module)
            {
                var appInfo = App.appInfo();
                return this._marketplaceManager.suitablePlatform(_.map(module.platforms, function (platform)
                {
                    return platform.platform;
                }));
            },
            installModule: function ()
            {
                new Installer([{
                    type: 'module', action: 'install', code: this._currentItem.install_code, module_id: this._currentItem.name,
                    platform: (this._currentItem.module.install_platform)
                }]).install(this.onInstall);

            },
            onInstall: function (err, installerOutput)
            {
                var self = this;
                if (err)
                {
                    new ModalHelper().error(err);
                }
                else
                {
                    var hadError = !!_.find(installerOutput.history, { success: false });
                    if (!hadError)
                    {
                        switch (this._currentItem.item_type)
                        {
                            case 'script':
                                new ModalHelper().confirm({
                                    text: T.t('marketplace.script_installed_text'),
                                    title: T.t('marketplace.install_result_title'),
                                    onButton: function (text)
                                    {
                                        if (text == 'Yes')
                                            App.request('scripts:getmanager').openScript(installerOutput.history[0].destfilepath);
                                    }
                                });
                                break;
                        }
                        this.trigger('finished', err, installerOutput)
                    }
                }
            }

        })
    }
)