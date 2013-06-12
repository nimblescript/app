define(['require', 'underscore', 'jquery',  'swig', 'backbone', 'Vent', 'bootstrap-modal',
    'text!./templates/prompt.html', 'text!./templates/alert.html','text!./templates/modal.html'],
    function (require, _, $, Swig, Backbone, Vent, BootstrapModal)
    {
        function ModalHelper()
        {

        }

        ModalHelper.GlobalDisableHide = false;

        _.extend(ModalHelper.prototype, Backbone.Events,
            {
                modal: function (el, options)
                {
                    var self = this;
                    var opts = _.extend({}, options);
                    var modal = this.activeModal = $(el).modal(_.pick(opts,
                       'focusOn', 'keyboard', 'backdrop', 'width', 'height', 'maxHeight', 'loading', 'spinner', 'consumeTab',
                       'replace', 'attentionAnimation', 'modalOverflow', 'manager'));

                    this._allowHide = false;
                    modal.on('click', '.modal-footer a.btn:not([disabled])', function (e)
                    {
                        if (!self.activeModal)
                            return false;

                        self._fakeModalAction = false;
                        modalAction(e.currentTarget.tagName == 'BUTTON' ? 'X' : $(e.currentTarget).attr('name'), function (response)
                        {
                            if (response === false)
                            {
                                self._allowHide = false;
                                e.preventDefault();
                                e.stopPropagation();
                                return false;
                            }
                            else
                            {
                                self._allowHide = true;
                                modal.modal('hide');
                            }

                        });
                    })

                    
                    function modalAction(action,callback)
                    {
                        self._allowHide = true;
                        if (opts.onButton)
                        {
                            if (opts.onButton.length == 2) // Presume callback
                            {
                                opts.onButton(action, function (response)
                                {
                                    self._allowHide = response === false ? false : true;
                                    callback && callback(response);
                                });
                            }
                            else
                            {
                                var ret = opts.onButton(action);
                                self._allowHide = ret === false ? false : true;
                                callback && callback(ret);
                                return ret;

                            }
                            
                        }
                        else
                            callback && callback();
                    };

                    modal.on('submit', 'form', function(e)
                    {
                        e.stopPropagation();
                        var defaultButton = _.filter(opts.buttons, { isDefault: true });
                        if (defaultButton[0])
                        {
                            var $button = modal.find('.modal-footer a:contains(' + defaultButton[0].text + ')');
                            $button.click();
                        }
                        return false;
                    })

                    modal.on('hide', function (e)
                    {
                        if (e.target != modal[0])
                            return;

                        if (ModalHelper.GlobalDisableHide)
                            return false;
                            
                        if (!self._allowHide)
                            return modalAction('X');
                    });

                    modal.on('hidden', function (e)
                    {
                        if (e.target != modal[0])
                            return;

                        self.activeModal = null;
                        if (opts.onClose)
                            opts.onClose();
                        self.trigger('closed');
                    })

                    opts.onCreate && opts.onCreate(modal);
                    return modal;

                },
                close: function ()
                {
                    this._allowHide = true;
                    this.activeModal.modal('hide');
                },
                getButton: function(name)
                {
                    return this.activeModal.find('.modal-footer a.btn[name=' + name + ']');
                },
                toggleButton: function (name, enabled)
                {
                    if (this.activeModal)
                    {
                        this.getButton(name).attr('disabled', enabled ? null : 'disabled');
                    }
                },
                view: function (options)
                {
                    var opts = _.defaults({}, options, {
                        focusOn: 'a.btn', title: 'Modal...',
                        buttons: [{
                            text: 'Cancel'
                        },
                    {
                        text: 'OK',
                        isDefault: true
                    }]
                    });
                    var modalHtml = require('text!./templates/modal.html');
                    var $html = $(Swig.compile(modalHtml)(opts));
                    $html.find('.modal-body').append(opts.view.render().$el)
                    return this.modal($html, opts);
                },
                confirm: function(options)
                {
                    var opts = _.defaults({}, options, {
                        focusOn: 'a.btn', title: 'Confirm...',
                        buttons: [{
                            text: 'Yes',
                            isDefault: true
                        },
                        {
                            text: 'No'
                        }],
                        width: '300px'
                    });

                    var alertHtml = require('text!./templates/alert.html');
                    return this.modal(Swig.compile(alertHtml)(opts), opts);

                },
                alert: function (options)
                {
                    var opts = _.defaults({}, options, {
                        focusOn: 'a.btn', title: 'Alert...',
                        buttons: [{
                            text: 'OK',
                            isDefault: true
                        }],
                        width: '300px'
                    });
                    
                    var alertHtml = require('text!./templates/alert.html');
                    return this.modal(Swig.compile(alertHtml)(opts), opts);
                },
                prompt: function (options)
                {
                    var opts = _.defaults({}, options, {
                        focusOn: 'input.active', title: 'Confirm...',
                        buttons: [{
                            text: 'Cancel'
                        },
                        {
                            text: 'OK',
                            isDefault: true
                        }]
                    });
                    var promptHtml = require('text!./templates/prompt.html');
                    return this.modal(Swig.compile(promptHtml)(opts), opts);
                },
                error: function (err, options)
                {
                    var text;
                    if (_.isString(err))
                        text = err;
                    else if (_.isArguments(err) || 
                        _.isArray(err) && _.isObject(err[0]) && _.isString(err[1]) ) // xhr array
                        text = 'Ajax error';
                    else if (_.isArray(err) )
                        text = err.join('<br/>');
                    else if (_.isObject(err))
                        text = err.messages.join('<br/>');
                    return this.alert(_.extend({ text: text, title: 'Error...' }, options));
                }
            }
            );

        return ModalHelper;
    }
)