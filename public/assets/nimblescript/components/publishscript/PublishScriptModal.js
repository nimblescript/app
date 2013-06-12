define(['require', 'underscore', 'backbone', 'App', 'logger', 'modalhelper', './PublishScriptView', 'translate', 'async'],
    function (require, _, Backbone, App, Logger, ModalHelper, PublishScriptView, T, Async)
    {
        "use strict"
        function PublishScriptModal(options)
        {
            this.options = _.extend({}, { height: 670, width: 650 }, options);
        }

        _.extend(PublishScriptModal.prototype, Backbone.Events,
            {
                show: function (callback)
                {
                    var self = this;
                    Async.waterfall([
                        function marketplaceAccess(cb)
                        {
                            var marketplaceManager = App.request('marketplace:getmanager');
                            marketplaceManager.checkAuthorization(function (err, authorized)
                            {
                                if (!authorized)
                                {
                                    marketplaceManager.authorize(function (authorized)
                                    {
                                        cb(!authorized)
                                    });
                                }
                                else
                                    cb();
                            });
                        },

                        function show(cb)
                        {
                            self.view = new PublishScriptView(self.options);
                            self.view.load(null, function (err)
                            {
                                if (err)
                                    return callback && callback(err);

                                self._createModal();
                                cb();
                            })
                        }
                    ],
                    function complete(err)
                    {
                        callback && callback(err);

                    });
                        
                },
                _createModal: function(callback)
                {
                    var self = this;
                    this.modalHelper = new ModalHelper();
                    this.modalHelper.view({
                        keyboard: false, backdrop: 'static',
                        focusOn: '[name=version]',
                        view: this.view, width: this.options.width, height: this.options.height,
                        title: T.t('components.publishscript.modal_title'),
                        buttons: [
                            {
                                text: T.t('components.publishscript.close'),
                                name: 'close'
                            }
                        ],
                        onClose: function ()
                        {
                            self.view.close();
                        }
                    });

                },
                updateButtonState: function ()
                {
                    this.modalHelper.toggleButton('close', true);
                }
            });

        return PublishScriptModal;

    }
)
