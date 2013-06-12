define(['require', 'jquery', 'underscore', 'backbone', 'marionette', 'App', 'logger', 'swig', 'modalhelper', 'async', 'notify', 'deep-model', 'select2/select2',
    'translate', 'extendable/FormItemView', 'cleditor', 'moment', './Publisher',
    'text!./publishscript.html', 'css!./publishscript.css', 'text!./itemsummary.html', 'text!./newrelease.html', 'text!./help.html'],
    function (require, $, _, Backbone, Marionette, App, Logger, Swig, ModalHelper, Async, Notify, DeepModel, $select2, T, FormItemView, $cleditor, moment, Publisher,
        html, css, itemSummaryHtml, newReleaseHtml, helpHtml)
    {
        "use strict"

        var ItemSummaryView = Marionette.ItemView.extend({
            constructor: function ()
            {
                _.bindAll(this, 'render');
                Marionette.ItemView.prototype.constructor.apply(this, arguments);
            },
            template: Swig.compile(itemSummaryHtml),
            modelEvents: {
                change: 'render'
            },
            templateHelpers: function ()
            {
                var item = this.model.get('item');
                var helpers = {
                    status: 'N/A',
                    latest_release_summary: 'N/A',
                    marketplace_url: ''
                }
                if (item)
                {
                    var latestReleaseSummary;
                    if (item.latest_release[0])
                    {
                        var latestRelease = item.latest_release[0];
                        latestReleaseSummary = _.template('v<%= version %> (r<%= release %>) - <%= publish_date %>')
                            ({
                                version: latestRelease.version, release: latestRelease.release_number,
                                publish_date: moment(latestRelease.publish_date).format('MMMM Do YYYY')
                            });
                    }
                    _.extend(helpers, {
                        status: _.capitalize(item.approval.status) + ', ' + (item.active ? T.t('marketplace.publish.active') : T.t('marketplace.publish.inactive')),
                        latest_release_summary: latestReleaseSummary,
                        marketplace_url: App.request('marketplace:getmanager').itemPublicUrl(item.item_id)
                    });
                }
                return helpers;
            }
        });

        var NewReleaseView = FormItemView.extend({
            formTemplate: Swig.compile(newReleaseHtml),
            template: Swig.compile(''),
            schema: {
                version: {
                    type: 'Text', title: 'Version', key: 'version', validators: ['required'], attachToParent: true
                },
                release_number: {
                    type: 'Text', title: 'Release Number', key: 'release_number', validators: ['required'], attachToParent: true
                },
                live_from: {
                    type: 'Date', title: 'Live From', key: 'live_from', editorClass: 'input-small', validators: ['required'], attachToParent: true
                },
                license: {
                    type: 'Select', title: 'License', key: 'license', editorClass: 'input-medium', validators: ['required'], attachToParent: true
                },
                summary: {
                    type: 'Text', title: 'Summary', key: 'summary', editorClass: 'input-xxlarge', validators: ['required',
                    function (value, formValues)
                    {
                        if (!/^\w+/.test(value))
                            return {
                                type: 'summary',
                                message: T.t('marketplace.publish.summary_required')
                            };
                    }], attachToParent: true
                },
                release_notes: {
                    type: 'HtmlEditor', title: 'Release Notes', key: 'release_notes', validators: ['required',
                    function (value, formValues)
                    {
                        if (!/^\w+/.test(value))
                            return {
                                type: 'release_notes',
                                message: T.t('marketplace.publish.release_notes_required')
                            };
                    }], attachToParent: true,
                    width: 600, height: 175
                }

            },
            initialize: function ()
            {
                this.schema.license.options = _.map(this.options.licenses, function (license)
                {
                    return { label: license.name, val: license.id };
                })
            },
            onRender: function ()
            {
                this._super();
                this.$el.i18n();
            }
        })

        return Marionette.Layout.extend({
            template: Swig.compile(html),
            constructor: function ()
            {
                _.bindAll(this);
                Marionette.Layout.prototype.constructor.apply(this, arguments);
            },
            className: 'publish-script',
            regions: {
                itemSummaryRegion: '.section.item',
                newReleaseRegion: '.section.release'
            },
            initialize: function ()
            {
                this._scriptManager = App.request('scripts:getmanager');
                this._marketplaceManager = App.request('marketplace:getmanager');
                this.model = new Backbone.DeepModel({
                    script_name: this._scriptManager.scriptName(this.options.scriptPath),
                    script_path: this.options.scriptPath,
                    summary: null,
                    item: null,
                    item_release: null,
                    licenses: null,
                    categories: null,
                    publishers: [],
                    items: [],
                    marketplace_account_url: this._marketplaceManager.marketplaceUrl('account')
                });
            },
            ui: {
                'publishers': '.publishers',
                'items': '.items',
                'publish': 'button.publish',
                'result': '.result'
            },
            modelEvents:
                {
                },
            events:
                {
                    'change .publishers': 'publisherChanged',
                    'click .refresh': 'refreshData',
                    'click .publish': 'publish',
                    'change .items': 'itemChanged',
                    'click .help': 'showHelp',
                    'keyup .field-row input': 'updateState',
                    'change .field-row input': 'updateState',
                    'change .field-row textarea': 'updateState',
                    'change .field-row select': 'updateState'
                },
            onRender: function ()
            {
                var self = this;
                this.itemSummaryRegion.show(new ItemSummaryView({
                    model: new Backbone.DeepModel({ item: this.model.get('item') })
                }));
                this.newReleaseRegion.show(new NewReleaseView({
                    model: new Backbone.DeepModel({
                        version: this.model.get('summary.version'),
                        release_number: this.model.get('summary.release'),
                        summary: '', release_notes: '',
                        license: this.model.get('item.latest_release.0.licese_type')
                    }),
                    licenses: this.model.get('licenses')
                }));
                this.ui.publishers.select2({
                    width: 'off',
                    data: function ()
                    {
                        var data = _.map(self.model.get('publishers'), function (publisher)
                        {
                            return { id: publisher.publisher_id, text: publisher.name };
                        });
                        return ({ results: data, text: 'text' });
                    }
                }).select2('val', this.model.get('item.publisher_id'));

                this.loadItems(this.model.get('item.publisher_id'), function ()
                {
                    self.ui.items.select2({
                        width: 'off',
                        data: function ()
                        {
                            var data = _.map(self.model.get('items'), function (item)
                            {
                                return { id: item.item_id, text: item.name };
                            });
                            return ({ results: data, text: 'text' });
                        }
                    }).select2('val', self.model.get('item.item_id'));
                });
                this.updateState();

            },
            load: function (scriptPath, options, callback)
            {
                _.isFunction(options) && (callback = options, options = {});
                _.isObject(options) || (options = {});

                var self = this;
                if (!scriptPath)
                    scriptPath = this.options.scriptPath;

                var scriptSummary, categories, licenses, existingItem;
                var notify = Notify.loading({ icon: false, text: 'Loading...' });
                Async.parallel([
                    function publishers(cb)
                    {
                        self.loadPublishers({ noCache: options.noCache }, cb);
                    },
                    function categories(cb)
                    {
                        self._marketplaceManager.getCategories({ noCache: options.noCache }, function (err, categories)
                        {
                            self.model.set('categories', categories);
                            cb(err);
                        });

                    },
                    function licenses(cb)
                    {
                        self._marketplaceManager.getLicenses({ noCache: options.noCache }, function (err, licenses)
                        {
                            self.model.set('licenses', licenses);
                            cb(err);
                        });

                    },
                    function scriptAndItem(cb)
                    {
                        Async.waterfall(
                            [
                                function scriptSummary(cb)
                                {
                                    self.getScriptSummary(scriptPath, function (err, summary)
                                    {
                                        self.model.set('summary', summary);
                                        cb(err)
                                    });
                                },
                                function item(cb)
                                {
                                    var itemId = self.model.get('summary.marketplace.id');
                                    self.loadItem(itemId, function (err, response)
                                    {
                                        cb()
                                    });
                                }
                            ],
                            function complete(err)
                            {
                                cb(err);
                            }
                        )
                    }
                ],
                function complete(err)
                {
                    if (err)
                    {
                        var modal = new ModalHelper().error(err);
                        modal.on('closed', function ()
                        {
                            self.trigger('error', err);
                        })
                    }
                    else
                    {
                        // Misc
                        var item = self.model.get('item');
                        if (item)
                            self.model.set('public_url', self._marketplaceManager.itemPublicUrl(self.model.get('item').item_id));
                        callback && callback();
                    }
                    notify.remove();
                });
            },
            getScriptSummary: function (scriptPath, callback)
            {
                var self = this;
                this._scriptManager.getScriptSummary(scriptPath, function (err, response)
                {
                    if (err || !response.success)
                        callback(err || response.messages)
                    else
                        callback && callback(null, response.returndata);
                });
            },
            loadItems: function (publisherId, options, callback)
            {
                _.isFunction(options) && (callback = options, options = {});
                _.isObject(options) || (options = {});

                var self = this;

                if (!publisherId)
                    publisherId = this.ui.publishers.select2('val');

                if (publisherId)
                {
                    this._marketplaceManager.getPublisherItems(publisherId, { noCache: options.noCache }, function (err, items)
                    {
                        self.model.set('items', items);
                        callback && callback();
                    });
                }
                else
                    callback && callback();
            },
            loadPublishers: function (options, callback)
            {
                _.isFunction(options) && (callback = options, options = {});
                _.isObject(options) || (options = {});

                var self = this;
                this._marketplaceManager.getPublishers({ noCache: options.noCache }, function (err, publishers)
                {
                    self.model.set('publishers', publishers);
                    callback(err);
                });

            },
            loadItem: function (itemId, callback)
            {
                var self = this;
                this._marketplaceManager.getItemInfo('item_id', itemId, { complete: true }, function (err, response)
                {
                    var item = _.deepResult(response, 'data.item');
                    if (_.deepResult(response, 'success'))
                        self.model.set(response.data);

                    if (self.itemSummaryRegion.$el)
                        self.itemSummaryRegion.currentView.model.set('item', item);
                    callback && callback(err);
                })
            },
            publisherChanged: function (e)
            {
                var self = this;
                this.loadItems(e.val, function ()
                {
                    self.ui.items.select2('val', self.model.get('item.item_id'), true);
                    self.updateState();

                });
            },
            itemChanged: function (e)
            {
                var self = this;
                this.loadItem(e.val, function ()
                {
                    self.updateState();
                });
            },
            selectedPublisher: function ()
            {
                return this.ui.publishers.select2('val');
            },
            selectedItem: function ()
            {
                return this.ui.items.select2('val');
            },
            setPublisher: function (id)
            {
                this.ui.publishers.select2('val', id);
            },
            validate: function ()
            {
                var ok = true;
                var errors = this.newReleaseRegion.currentView.validate();
                if (!errors)
                {
                    var data = this.buildPublishData();
                    if (!data.publisher_id || !data.item_id)
                        ok = false;
                }
                else
                    ok = false;

                return ok;
            },
            buildPublishData: function ()
            {
                var formData = {
                    publisher_id: this.selectedPublisher(),
                    item_id: this.selectedItem()
                };
                _.extend(formData, this.newReleaseRegion.currentView.getValues());
                return formData;
            },
            updateState: function ()
            {
                var canPublish = this.validate();
                var buttonAction = canPublish ? 'buttonEnable' : 'buttonDisable'
                this.ui.publish[buttonAction]();
            },
            refreshData: function ()
            {
                this.load(this.options.scriptPath, { noCache: true });
            },
            showHelp: function ()
            {
                new ModalHelper().alert({
                    text: T.t('marketplace.publish.help_content'),
                    width: 400,
                    height: 300,
                    title: T.t('marketplace.publish.help_title')
                });

            },
            publish: function ()
            {
                var self = this;

                var publisher = new Publisher();
                publisher.publish([{
                    item: this.model.get('item'),
                    new_release: _.extend(this.buildPublishData(), { item_path: this.model.get('script_path') })
                }], function (result)
                {
                    var item = result.history[0];
                    if (item.success)
                    {
                        self.ui.result.html(T.t('marketplace.publish.script_published',
                            {
                                url: self._marketplaceManager.marketplaceUrl('item_release_admin', { item_id: item.response.item_id, item_release_id: item.response.item_release_id })
                            }
                        ));
                    }
                })
            }
        });
    }
)
