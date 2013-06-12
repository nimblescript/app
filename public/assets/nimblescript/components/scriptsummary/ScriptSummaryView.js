define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', 'translate', 'text!./scriptsummary.html','css!./scriptsummary'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, T, html,css)
    {
        "use strict"

        return Marionette.ItemView.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    Marionette.ItemView.prototype.constructor.apply(this, arguments);
                },
                modelEvents: {
                    "change": "render"
                },
                template: Swig.compile(html),
                tagName: 'div',
                initialize: function()
                {
                    this.model = new Backbone.Model();
                    this._repositoryManager = App.request('repository:getmanager');
                    this._scriptManager = App.request('scripts:getmanager');
                    this._super();

                },
                loadSummary: function (scriptPath)
                {
                    var self = this;
                    this._scriptManager.getScriptSummary(scriptPath, function (err, response)
                    {
                        if (err)
                            self.setEmpty();
                        else
                        {
                            if (response.success)
                                updateModel(self.model, response.returndata.title, response.returndata.description, response.returndata.version, response.returndata.author);
                            else
                                updateModel(self.model, self._scriptManager.scriptName(scriptPath), response.messages.join(';'));
                        }
                            
                    });
                    
                },

                setEmpty: function ()
                {
                    updateModel(this.model)
                }

            });

        function updateModel(model,title, description, version, author)
        {
            model.set({
                title: title,
                description: description,
                version: version,
                author: author
            })
        }
    }
)
