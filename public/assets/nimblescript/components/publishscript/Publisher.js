define(['marionette', 'backbone', 'underscore', 'swig', 'jquery', 'App', 'text!./publisher.html', 'modalhelper', 'translate', 'async'],
    function (Marionette, Backbone, _, Swig, $, App, html, ModalHelper, T, Async)
    {
        "use strict";
        var PublisherView = Marionette.ItemView.extend({
            constructor: function ()
            {
                _.bindAll(this);
                Marionette.ItemView.prototype.constructor.apply(this, arguments);
            },
            template: Swig.compile(html),
            className: 'marketplace-publisher',
            ui: {
                log: 'textarea'
            },
            info: function (text)
            {
                this.ui.log.append(text + '\r');
            },
            error: function (text)
            {
                this.ui.log.append(text + '\r');
            }

        })

        function Publisher(options)
        {
            _.extend(this,
                {
                    options: _.defaults({}, options, { noView: false } ),
                    publishHistory: [],
                    publishLog: [],
                    finished: false
                })
            _.each(['info', 'error'], function (logType)
            {
                this[logType] = this.log.bind(this, logType);
            }, this);
            this._createView();
        }

        _.extend(Publisher.prototype, Backbone.Events,
            {
                publish: function (toAction,callback)
                {

                    var self = this;
                    this._callback = callback;
                    this.init(toAction);
                    this.doPublish(toAction,callback);

                },
                _createView: function()
                {
                    var self = this;

                    if (this.options.noView)
                        return;
                    
                    this.view = new PublisherView();
                    this.modalHelper = new ModalHelper();
                    this.modalHelper.view({
                        focusOn: 'textarea',
                        buttons: [{ text: 'Close', defaultButton: true, disabled: true }],
                        title: T.t('marketplace.publish.publisher.title'),
                        view: this.view,
                        width: 650, height: 300,
                        onButton: function (text)
                        {
                            if (self.finished)
                                self._callback && self._callback({ history: self.publishHistory, log: self.publishLog });
                            return self.finished;
                        }
                    });
                },
                log: function (type, text, data)
                {
                    this.view[type].apply(this.view, Array.prototype.slice.call(arguments, 1));
                    this.publishLog.push({ type: type, text: text, data: data });
                },
                init: function (toAction)
                {
                    var self = this;
                    this.info(T.t('marketplace.publish.publisher.preparing_to_publish'));
                    _.each(toAction, function (item)
                    {
                        var itemSummary = T.t('marketplace.publish.publisher.item_summary',
                            { version: item.new_release.version, release: item.new_release.release_number, name: item.item.name });
                        self.info(' - ' + itemSummary);
                    });
                },
                doPublish: function (toAction)
                {
                    var self = this;
                    var marketplaceManager = App.request('marketplace:getmanager');
                    Async.eachSeries(toAction, function (item, cb)
                    {
                        var itemSummary = T.t('marketplace.publish.publisher.item_summary',
                            { version: item.new_release.version, release: item.new_release.release_number, name: item.item.name });

                        var historyItem = _.clone(item);
                        self.publishHistory.push(historyItem);
                        var publisherArgs;
                        self.info(T.t('marketplace.publish.publisher.publishing_script') + ' - ' + itemSummary);
                        marketplaceManager.publishItem(item.new_release,
                            function publishResponse(err, response)
                            {
                                self.processResponse(historyItem, err, response);
                                cb();
                            });
                    }, function complete()
                    {
                        self.info(T.t('marketplace.publish.publisher.finished'));
                        self.finished = true;

                        // Do callback straight away if no view, otherwise closing modal triggers callback
                        if (!self.options.noView)
                            self.modalHelper.toggleButton('Close', true);
                        else
                            self._callback && self._callback({ history: self.publishHistory, log: self.publishLog });
                    });
                },
                processResponse: function(historyItem, err,response)
                {
                    historyItem.success = !err && response.success;
                    historyItem.messages = this.errorToText(err || response.messages);
                    historyItem.response = response;
                    historyItem.error = err;
                    if (err || !response.success)
                    {
                        this.error(T.t('marketplace.publish.publisher.failed'));
                        _.each(historyItem.messages, function (message)
                        {
                            this.error(' - ' + message);
                        }, this);
                        if (response)
                        {
                            if (response.validation)
                            {
                                _.each(response.validation, function (validationError)
                                {
                                    var tPrefix = 'marketplace.publish.fields.' + validationError.field;
                                    this.error(' - ' + T.t(tPrefix + '.name') + ': ' + T.t(tPrefix + '.errors.' + validationError.code, { hint: validationError.hint }));
                                }, this);
                            }
                        }
                    }
                    else
                        this.info(T.t('marketplace.publish.publisher.success'));

                },
                errorToText: function (err)
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

        return Publisher;
    }
)