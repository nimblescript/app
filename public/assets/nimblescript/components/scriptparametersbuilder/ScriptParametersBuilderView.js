define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', 'text!./scriptparametersbuilder.html', 'text!./getparameters.html',
    'css!./scriptparametersbuilder.css', 'ace/ace', 'select2/select2', '../editor/EditorView', 'text!./parametertype.html',
    'text!./parameterrow.html','translate'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, html, getParametersHtml, css,
        Ace, $select2, EditorView, parameterTypeHtml, parameterRowHtml,T)
    {
        "use strict"

        var ParameterSummaryView = Marionette.ItemView.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    Marionette.ItemView.prototype.constructor.apply(this, arguments);
                },
                template: Swig.compile(parameterRowHtml),
                tagName: 'tr',
                modelEvents: {
                    // 'change': 'render'
                },
                events: {
                    'change input': 'updateModel',
                    'keyup input': 'updateModel',
                    'click button[data-action=settings]': 'editSettings'
                },
                ui: {
                    id: 'input[name=id]',
                    name: 'input[name=name]',
                    required: 'input[name=required]'
                },
                onRender: function ()
                {
                    this.$el.attr({ 'data-param-type': this.model.get('type'), 'data-param-num': this.model.get('param-num') });
                },
                updateModel: function ()
                {
                    var data = { id: this.ui.id.val(), name: this.ui.name.val(), required: this.ui.required.prop('checked') };
                    this.model.set(data);
                },
                editSettings: function ()
                {
                    this.model.get('typeWrapper').editSettings();
                }
            });
        
        
        return Marionette.CompositeView.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    Marionette.CompositeView.prototype.constructor.apply(this, arguments);
                },
                collectionEvents: {
                    'add': 'updateParameters',
                    'remove': 'updateParameters',
                    'change': 'updateParameters'
                },
                events: {
                    'click a[data-action=new]': 'onNewParameter',
                    'click button[data-action=remove]': 'onRemoveParameter',
                    'change input[type=checkbox]': 'toggleCondensed'
                },
                ui: {
                    parameterTypes: 'ul.parameter-types',
                    parameters: 'tbody'
                },
                template: Swig.compile(html),
                tagName: 'div',
                itemView: ParameterSummaryView,
                className: 'script-parameters-builder',
                initialize: function()
                {
                    this._condensed = false;
                    this._paramCounter = 1;
                    this._getParametersCompiled = Swig.compile(getParametersHtml);
                    this._parameterTypeRowCompiled = Swig.compile(parameterTypeHtml);
                    this._repositoryManager = App.request('repository:getmanager');
                    this._scriptManager = App.request('scripts:getmanager');
                    var self = this;
                    this.collection.each(function (param)
                    {
                        param.set('param-num', self._paramCounter++)
                        self.augmentParam(param);
                    });

                },
                onRender: function ()
                {
                    var self = this;
                    this.initEditor();
                    this.populateParameterTypes();
                    this.updateParameters();
                    this.ui.parameters.sortable(
                        {
                            items: '> tr',
                            stop: function (e, ui)
                            {
                                var newPos = $(this).children().index(ui.item[0]);
                                var param = self.collection.findWhere({ 'param-num': parseInt(ui.item.attr('data-param-num')) });
                                var oldPos = self.collection.indexOf(param);
                                self.collection.models.splice(newPos,0, self.collection.models.splice(oldPos,1)[0]);
                                self.updateParameters();
                            }
                        })
                },
                onClose: function ()
                {
                    this.codeRegion.close();
                },
                // Custom 
                initEditor: function ()
                {
                    this.codeRegion = new Marionette.Region({ el: this.$el.find('.code') });
                    this.editor = new EditorView({ readonly: true });
                    this.codeRegion.show(this.editor);
                },
                populateParameters: function()
                {

                },
                appendHtml: function(collectionView, itemView, index)
                {
                    this.ui.parameters.append(itemView.el);
                },
                populateParameterTypes: function()
                {
                    var self = this;
                    _.each(this._scriptManager.parameterTypes(), function (parameterType)
                    {
                        self.ui.parameterTypes.append(self._parameterTypeRowCompiled(parameterType));
                    })
                },
                updateParameters: function(e)
                {
                    this.parameters = this.buildParameters();
                    var parameters = [];
                    _.each(this.parameters, function(parameter)
                    {
                        parameters.push(_.compactObject(parameter, true));
                    });

                    var parametersObjectText;
                    if (this._condensed)
                    {
                        parametersObjectText = '[' + '\n';
                        _.each(parameters, function(parameter,i)
                        {
                            parametersObjectText += JSON.stringify(parameter);
                            if ((i - 1 )< parameters.length - 1)
                                parametersObjectText += ','
                            parametersObjectText += '\n';
                        });
                        parametersObjectText += ']' + '\n';
                    }
                    else
                        parametersObjectText = JSON.stringify(parameters, null, 4);

                    this.parametersText = this._getParametersCompiled({ parameters: parametersObjectText });
                    this.editor.setValue(this.parametersText);
                    this.editor.clearSelection();
                },
                buildParameters: function ()
                {
                    var parameters = [];
                    this.collection.each(function (param)
                    {
                        parameters.push(param.get('typeWrapper').toObject());

                    });
                    return parameters;

                },
                onInputChange: function()
                {

                },
                newParameterData: function()
                {
                    var paramNum = this._paramCounter++,
                        idPostfix = paramNum;
                    var id = 'param' + idPostfix;
                    while (this.collection.find({ id: id }))
                        id = 'param' + (++idPostfix);
                    return { num: paramNum, id: id };
                },
                onNewParameter: function (e)
                {
                    var paramType = $(e.currentTarget).attr('data-param-type');
                    this.newParameter(paramType);
                },
                newParameter: function (paramType)
                {
                    var self = this;
                    var newParamData = this.newParameterData();
                    var param = { 'param-num': newParamData.num, id: newParamData.id, name: T.t('script.parameters_builder.default_parameter_name'),type: paramType };
                    this._scriptManager.createTypeWrapper(param, function (paramTypeInstance)
                    {
                        if (paramTypeInstance)
                        {
                            self.augmentParam(paramTypeInstance.model);
                            self.collection.add(paramTypeInstance.model);
                        }
                    });
                },
                onRemoveParameter: function(e)
                {
                    this.removeParameter(parseInt($(e.currentTarget).parent().parent().attr('data-param-num')));
                },
                removeParameter: function (paramNum)
                { 
                    var param = this.collection.findWhere({ 'param-num': paramNum });
                    this.collection.remove(param)
                },
                augmentParam: function(param)
                {
                    var typeWrapper = param.get('typeWrapper');
                    _.each(_.result(typeWrapper,'defaultValues'), function(value, key)
                    {
                        if (!param.has(key) )
                            param.set(key, value);
                    })
                    param.set('hassettings', _.result(typeWrapper, 'hasSettings'));
                },
                toggleCondensed: function ()
                {
                    this._condensed = !this._condensed;
                    this.updateParameters();
                }


            });
    }
)
