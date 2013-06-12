define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', 'text!./parameters.html','./ParameterView'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, parametersHtml,ParameterView)
    {
        "use strict"


        return Marionette.ItemView.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    Marionette.ItemView.prototype.constructor.apply(this, arguments);
                },
                template: Swig.compile(parametersHtml),
                tagName: 'div',
                onRender: function()
                {
                    this._parameterViews = {};
                    var self = this;
                    this.model.get('parameters').each(function (model)
                    {
                        var parameterView = new ParameterView({ model: model });
                        self._parameterViews[model.get('id')] = parameterView;
                        var $parameterEl = parameterView.render().$el;
                        self.$el.append($parameterEl);
                    });
                },
                onClose: function ()
                {
                    _.each(this._parameterViews, function(parameterView)
                    {
                        parameterView.close();
                    })
                },
                onShow: function ()
                {
                    _.each(this._parameterViews, function (parameterView)
                    {
                        parameterView.onShow();
                    })
                },
                validate: function()
                {
                    var errors = {};
                    _.each(this._parameterViews, function(parameterView)
                    {
                        var ret = parameterView.validate();
                        if (!_.isEmpty(ret))
                            errors[parameterView.model.get('id')] = ret;
                    })
                    return !_.isEmpty(errors) && errors;
                },
                getValues: function ()
                {
                    var data = {};
                    _.each(this._parameterViews, function (view, paramId)
                    {
                        data[paramId] = { value: view.getValue() }
                    });
                    return data;
                },
                setValues: function(values)
                {
                    var self = this;
                    _.each(values, function (param, paramId)
                    {
                        self._parameterViews[paramId] && self._parameterViews[paramId].setValue(param.value);
                    });
                },
                setParameterErrors: function(parameterErrors)
                {
                    _.each(this._parameterViews, function (view)
                    {
                        view.setError(parameterErrors[view.model.get('id')]);
                    });
                },
                reset: function ()
                {
                    _.each(this._parameterViews, function (view)
                    {
                        view.reset();
                    });

                }
            });
    }
)
