define(['require','backbone', 'underscore','jquery', 'App', 'logger', 'modalhelper'],
    function (require, Backbone, _,$, App, Logger,ModalHelper)
    {
        "use strict"

        function Parameter(options)
        {
            this.options = options || {};
            this.model = this.options.model || this.model || new Backbone.Model();
        }

        Parameter.extend = Backbone.Model.extend;

        _.extend(Parameter.prototype, Backbone.Events,
            {
                id: function ()
                {
                    return this.model.get('id');
                },
                type: function()
                {
                    return this.model.get('type');
                },
                required: function()
                {
                    return this.model.get('required');
                },
                name: function()
                {
                    return this.model.get('name');
                },
                description: function ()
                {
                    return this.model.get('description');
                },
                about: function ()
                {

                },
                hasSettings: function()
                {
                    return false;
                },
                editSettings: function ()
                {
                    var view = _.result(this, 'settingsView');
                    if (!view)
                        return false;

                    var self = this;
                    var modalHelper = new ModalHelper();
                    var $modal = modalHelper.view( 
                        { width: 600, view: view, title: 'Parameter Settings', focusOn: '[name=description]', 
                        onButton: function(text)
                        {
                            if (text == 'OK')
                                return self.saveSettings();
                            return true;
                        }
                    });
                    this.listenTo(view, 'submit', function(e)
                    {
                        if (self.saveSettings() )
                            modalHelper.close();
                        e.preventDefault();
                    });

                },
                saveSettings: function()
                {

                },
                // optionsView: undefined,
                // model: undefined,
                toObject: function()
                {
                    var obj = {
                        name: _.result(this, 'name'),
                        id: _.result(this,'id'),
                        required: _.result(this,'required'),
                        description: _.result(this,'description'),
                        type: _.result(this,'type')
                    };
                    return obj;
                }
            });

        return Parameter;
    }
)
