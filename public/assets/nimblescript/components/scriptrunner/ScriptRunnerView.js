define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', 'text!./scriptrunner.html',
    'css!./scriptrunner.css', './sections/parameters/ParametersView', './sections/result/ResultView', './sections/summary/SummaryView', 'select2/select2',
    'modalhelper', 'translate'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, html, css, ParametersView,
        ResultView, SummaryView, $select2, ModalHelper,T)
    {
        "use strict"

        var instanceId = 1;
        return Marionette.Layout.extend(
            {
                constructor: function ()
                {
                    _.bindAll(this);
                    Marionette.Layout.prototype.constructor.apply(this, arguments);
                },
                events: {
                    'click a[data-action=run]:not(.disabled)': 'run',
                    'click a[data-action=reset]:not(.disabled)': 'reset',
                    'click a[data-action=edit-script]': 'editScript',
                    'click a[data-action=save-favorite]': 'saveFavorite',
                    'click a[data-action=load-favorite]': 'loadFavorite',
                    'click a[data-action=delete-favorite]': 'deleteFavorite'
                },
                ui: {
                    'favorites': 'select.favorites',
                    'runResult': '.runresult',
                    'run': 'a[data-action=run]',
                    'reset': 'a[data-action=reset]'
                },
                template: Swig.compile(html),
                tagName: 'div',
                className: 'script-runner',
                regions: {
                    summaryRegion: '.run-script-summary-section',
                    parametersRegion: '.run-script-parameters',
                    resultRegion: '.run-script-results-section'
                },
                initialize: function ()
                {
                    this.model = new Backbone.Model(_.extend({}, this.options.data, { id: instanceId++ },
                        _.pick(this.options, 'showDetails', 'showResult', 'showParameters')));
                    this._scriptManager = App.request('scripts:getmanager');
                    this._favoritesManager = App.request('favorites:getmanager');
                    this.listenTo(this._favoritesManager, 'all', this.onFavoritesEVent);
                },
                onRender: function ()
                {
                    this.summaryView = new SummaryView({ model: this.model });
                    this.summaryRegion.show(this.summaryView);
                    this.parametersView = new ParametersView({ model: this.model });
                    this.parametersRegion.show(this.parametersView);
                    this.resultView = new ResultView({ model: this.model });
                    this.resultRegion.show(this.resultView);
                    this.populateFavoritesList();

                    if (this.options.paramValues)
                        this.setParameterValues(this.options.paramValues);
                    if (this.options.run)
                        this.run();
                },
                /* Custom */
                afterShow: function ()
                {
                    this.resultView.onShow();
                    this.parametersView.onShow();
                    this.summaryView.onShow();
                },
                populateFavoritesList: function ()
                {
                    var self = this;
                    this._favoritesManager.search({ filter: { type: 'runscript', scriptname: this._scriptManager.scriptName(this.options.data.scriptpath) } }, function (err, favorites)
                    {
                        if (!err)
                        {
                            var current = self.ui.favorites.val();
                            self.ui.favorites.empty();
                            self.ui.favorites.addSelectOption('<New>', '', _.isEmpty(current))
                            _.each(favorites, function (favorite)
                            {
                                self.ui.favorites.addSelectOption(favorite.name, favorite.name, _.isEqual(current, favorite.name), { data: favorite.content } );
                            })
                            self.ui.favorites.select2();
                        }
                    });
                },
                run: function ()
                {
                    var validationErrors = this.parametersView.validate();
                    if (!validationErrors)
                    {
                        var params = this.parametersView.getValues();
                        this.ui.run.buttonDisable(T.t('script.running'));
                        this.ui.reset.buttonDisable();
                        this.setResult(T.t('script.running'), 'info');

                        var self = this;

                        this._scriptManager.runScript(this.options.data.scriptpath, { parameters: this.getParameterValues() }, function (err, response)
                        {
                            self.toggleSection('result', false);
                            self.ui.run.buttonEnable();
                            self.ui.reset.buttonEnable();
                            if (err)
                                self.setResult(T.t('script.error'), 'important', T.t('script.run_error'));
                            else
                                self.processResponse(response)
                        });
                    }
                    else
                    {
                        this.setResult(T.t('script.parameter_errors'), 'important');
                    }
                    return validationErrors;
                },
                processResponse: function (response)
                {
                    if (response.success )
                        this.processResponseReturn(response)
                    else
                        this.processResponseError(response);
                },
                processResponseReturn: function (response)
                {
                    var returnData = response.returndata
                        , self = this
                        , scriptOutput;

                    var responseProcessors = {
                        'success': this.processResponseSuccess,
                        'dataerror': this.processResponseDataError,
                        'runerror': this.processResponseRunError
                    };
                    if (responseProcessors[returnData.runresult])
                        responseProcessors[returnData.runresult](returnData, scriptOutput);
                    else
                        self.setResult(T.t('script.script_error'), 'important', T.t('unknown_runresult'));
                },
                parseScriptOutput: function (output)
                {
                    try
                    {
                        return JSON.parse(output);
                    }
                    catch (e)
                    {
                        return output;
                    }
                },
                processResponseSuccess: function (returnData)
                {
                    this.setResult(T.t('script.success'), 'success', this.parseScriptOutput(returnData.output), returnData.filelists);
                },
                processResponseDataError: function (returnData)
                {
                    var message = T.t('script.run_parameter_error');
                    if (returnData.message)
                        message += '\n\n' + returnData.message;
                    if (returnData.parameterErrors)
                        this.parametersView.setParameterErrors(returnData.parameterErrors);

                    this.setResult(T.t('script.data_error'), 'important', message);
                },
                processResponseRunError: function (returnData)
                {
                    var message = T.t('script.run_execution_error');
                    if (returnData.message)
                        message += '\n\n' + returnData.message;
                    this.setResult(T.t('script.run_error'), 'important', message);
                },
                processResponseError: function (response)
                {
                    this.setResult(T.t('script.script_error'), 'important', response.messages.join('\n'));
                },
                setResult: function (result, level, output, fileLists)
                {
                    this.ui.runResult.text(result).removeClass('label-important label-success label-warning label-info').addClass('label-' + level);
                    this.model.set('result',
                        { output: output && (_.isObject(output) ? JSON.stringify(output, null, 4) : output.toString()), filelists: fileLists });
                },
                selectedFavoritesList: function ()
                {
                    return this.ui.favorites.val();
                },
                selectedFavoriteData: function()
                {
                    return this.ui.favorites.find('option:selected').data('data');
                },
                loadFavorite: function ()
                {
                    var favoriteName = this.selectedFavoritesList();
                    if (!_.isEmpty(favoriteName))
                    {
                        var favorite = this.selectedFavoriteData();
                        this.setParameterValues(favorite.parameters);
                    }
                },
                saveFavorite: function ()
                {
                    var self = this;
                    var favoriteName = this.selectedFavoritesList();
                    if (_.isEmpty(favoriteName))
                    {
                        var modal = new ModalHelper().prompt({
                            title: 'Save as favorite...',
                            text: 'Specify name to save as',
                            onButton: function (text)
                            {
                                if (text == 'OK')
                                {
                                    var name = modal.find('input.active').val();
                                    var r = /[A-Za-z\-_\s0-9]+/;
                                    if (!name.match(r))
                                    {
                                        new ModalHelper().alert({ title: 'Error...', text: 'Only following characters are supported:<br/> A-Z, a-z, 0-9, _, -, and spaces' });
                                        return false;
                                    }
                                    doSave(name);
                                }
                                return true;
                            }
                        });
                    }
                    else
                        doSave(favoriteName);


                    function doSave(name)
                    {
                        self._savingFavorite = true;
                        self._favoritesManager.saveFavorite(name, {
                            parameters: self.getParameterValues(),
                            scriptpath: self.options.data.scriptpath,
                            scriptname: self._scriptManager.scriptName(self.options.data.scriptpath),
                            type: 'runscript'
                        },
                            null, function (err)
                            {
                                if (err)
                                    new ModalHelper().error(err)
                                self._savingFavorite = false;

                            });
                    }

                },
                deleteFavorite: function ()
                {
                    var self = this;
                    var favoriteName = this.selectedFavoritesList();
                    if (!_.isEmpty(favoriteName))
                        self._favoritesManager.deleteFavorite(favoriteName, function (err)
                        {
                            err && new ModalHelper().error(err)
                        });
                },
                onFavoritesEVent: function (eVentType, name, arg2)
                {
                    var favoriteName = this.selectedFavoritesList();
                    switch (eVentType)
                    {
                        case 'favorite:saved':
                        case 'favorite:loaded':
                            if (arg2.scriptname == this._scriptManager.scriptName(this.options.data.scriptpath))
                                this.ui.favorites.addSelectOption(name, name, null, { data: arg2 });
                            break;
                        case 'favorite:renamed':
                            this.ui.favorites.children('option[value="' + name + '"]').attr('value', arg2).text(arg2);
                            break;
                        case 'favorite:deleted':
                            this.ui.favorites.children('option[value="' + name + '"]').remove();
                            // Set <New> selected if deleted is current
                            if (_.isEqual(name, favoriteName))
                                this.ui.favorites.children().eq(0).prop('selected', true);
                            break;
                    }
                    this.ui.favorites.select2('val', this._savingFavorite ? name : favoriteName);
                },
                getParameterValues: function ()
                {
                    return this.parametersView.getValues();
                },
                setParameterValues: function (values)
                {
                    this.parametersView.setValues(values);
                },
                reset: function ()
                {
                    this.parametersView.reset();
                    this.setResult('');
                    this.toggleSection('result', true);
                },
                editScript: function ()
                {
                    this._scriptManager.editScript(this.options.data.iteminfo.path);
                },
                toggleSection: function (sectionName, collapse)
                {
                    var $section = this.$el.find('[data-section="' + sectionName + '"]');

                    if (!collapse && !$section.hasClass('in'))
                        $section.collapse('show');

                    if (collapse)
                        $section.collapse({ toggle: false }).collapse('hide');
                }

            });
    }
)
