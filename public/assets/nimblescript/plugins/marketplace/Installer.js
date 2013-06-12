define(['marionette', 'backbone', 'underscore', 'swig', 'Vent', 'jquery', 'App','text!./installer.html','modalhelper','translate', 'async'],
    function (Marionette, Backbone, _, Swig, Vent, $, App,html,ModalHelper,T, Async)
    {
        "use strict";
        var InstallerView = Marionette.ItemView.extend({
            constructor: function()
            {
                _.bindAll(this);
                Marionette.ItemView.prototype.constructor.apply(this, arguments);
            },
            template: Swig.compile(html),
            className: 'marketplace-installer',
            ui: {
                log: 'textarea'
            },
            info: function (text)
            {
                this.ui.log.append(text + '\r\n');
            },
            error: function (text)
            {
                this.ui.log.append(text + '\r\n');
            }

        })

        function Installer(toAction, settings)
        {
            _.extend(this, 
                {
                    toAction: toAction || [],
                    settings: settings || {}
                })
        }

        _.extend(Installer.prototype, Backbone.Events,
            {
                install: function (callback)
                {
                    var self = this;
                    this.view = new InstallerView();
                    this.finished = false;
                    this.modalHelper = new ModalHelper();
                    this.modalHelper.view({
                        focusOn: 'textarea',
                        buttons: [{ text: 'Close', defaultButton: true, disabled: true }],
                        title: T.t('marketplace.installer.title'),
                        view: this.view,
                        width: 650,
                        height: 300,
                        onButton: function (text)
                        {
                            if (self.finished)
                                callback(null, { history: self.installHistory, log: self.installLog });
                            return self.finished;
                        }
                    });
                    this.installHistory = [];
                    this.installLog = [];
                    _.each(['info', 'error'], function (logType)
                    {
                        self[logType] = self.log.bind(self,logType);
                    });
                    this.init();
                    this.doInstall();
                },
                log: function(type, text, data)
                {
                    this.view[type].apply(this.view, Array.prototype.slice.call(arguments,1));
                    this.installLog.push({ type: type, text: text, data: data });
                },
                init: function()
                {
                    var self = this;
                    this.info(T.t('marketplace.installer.preparing_to_action'));
                    _.each(this.toAction, function (item)
                    {
                        switch (item.type)
                        {
                            case 'script':
                                self.info(' - ' + T.t('marketplace.installer.script') + ': ' + item.name);
                                break;
                            case 'module':
                                self.info(' - ' + T.t('marketplace.installer.module') + ': ' + item.module_id);
                                break;
                        }
                    });
                },
                doInstall: function ()
                {
                    var self = this;
                    var marketplaceManager = App.request('marketplace:getmanager');
                    var settingsManager = App.request('settings:getmanager');
                    Async.eachSeries(this.toAction, function (item,cb)
                    {
                        var historyItem = _.clone(item);
                        self.installHistory.push(historyItem);
                        var installerArgs;
                        switch (item.type)
                        {
                            case 'script':
                                self.info(T.t('marketplace.installer.installing_script') + ' \'' + item.name + '\' to \'' + item.destfilepath + '\'');
                                marketplaceManager.installItem(item.code, { destfilepath: item.destfilepath }, afterInstall);
                                break;
                            case 'module':
                                switch (item.action)
                                {
                                    case 'install':
                                        self.info(T.t('marketplace.installer.installing_module') + ' \'' + item.module_id + '\'');
                                        marketplaceManager.installItem(item.code, { enable: true, platform: item.platform }, afterInstall);
                                        break;
                                    case 'enable':
                                        self.info(T.t('marketplace.installer.enabling_module') + ' \'' + item.module_id + '\'');
                                        var s = {};
                                        s['modules.' + item.module_id + '.enabled'] = true;
                                        settingsManager.set(s, function ()
                                        {
                                            self.info(T.t('marketplace.installer.enabled'));
                                            cb();
                                        });

                                }
                                break;
                        }
                        
                        function afterInstall(err, response)
                        {
                            historyItem.success = !err && response.success;
                            if (err || !response.success)
                            {
                                historyItem.messages = self.errorToText(err || response.messages);
                                self.error(T.t('marketplace.installer.install_failed') + ': ' + historyItem.messages.join('<br/>'));
                            }
                            else
                                self.info(T.t('marketplace.installer.install_success'));
                            cb();
                        };

                    }, function complete()
                    {
                        self.info(T.t('marketplace.installer.finished'));
                        self.finished = true;
                        self.modalHelper.toggleButton('Close', true);
                    });
                },
                errorToText: function(err)
                {
                    var text;
                    if (_.isString(err))
                        text = [err];
                    else if (_.isArguments(err))
                        text = [T.t('system.ajax_error')];
                    else if (_.isObject(err) && _.isArray(err.messages))
                        text = err.messages;
                    else if (_.isArray(err))
                        text = err;
                    else
                        text = [T.t('system.unknown_error')];
                    return text;

                }
            })

        return Installer;
    }
)