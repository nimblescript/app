define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', 'modalhelper', 'translate', 'text!./scripteditor.html', 'css!./scripteditor',
    './ScriptHelper', '../editor/EditorView', '../simplelist/SimpleListView', 'text!./keyboardshortcuts.html'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, ModalHelper, T, html, css, ScriptHelper, EditorView, SimpleListView, htmlShortcuts)
    {
        "use strict"

        return Marionette.Layout.extend(
            {
                // Marionette functions
                constructor: function ()
                {
                    _.bindAll(this);
                    Marionette.Layout.prototype.constructor.apply(this, arguments);
                },
                modelEvents: {
                    "change": "render"
                },
                template: Swig.compile(html),
                tagName: 'div',
                className: 'script-editor',
                initialize: function ()
                {
                    this._repositoryManager = App.request('repository:getmanager');
                    this._clipboardManager = App.request('clipboard:getmanager');
                    this._documentManager = App.request('documents:getmanager');
                    this._scheduledLintRefresh = false;
                    this._lintVisible = false;

                    this._super();

                },
                events: {
                    'click a[data-action=show-summary-builder]': 'showSummaryBuilder',
                    'click a[data-action=show-parameters-builder]': 'showParametersBuilder',
                    'click a[data-action=shortcuts]': 'showShortcuts',
                    'click button[data-action=lint-toggle]': function () { this.toggleLint(); },
                    'click button[data-action=run]': function () { this.trigger('run') },
                    'click button[data-action=publish]': function () { this.trigger('publish') },
                    'click .lint-section a.close': function () { this.toggleLint(false) }
                },
                regions: {
                    editorRegion: '.the-editor',
                    lintRegion: '.lint-list'
                },
                ui: {
                    toggleLint: 'button[data-action=lint]',
                    lintSection: '.lint-section'
                },
                onRender: function ()
                {

                    this.initEditor();
                    this.initLint();
                },
                initEditor: function ()
                {
                    var self = this;

                    this.editor = new EditorView({ initialContent: this.initialContent });
                    this.listenTo(this.editor, 'changed', function ()
                    {
                        self.trigger('changed');
                    });
                    this.editorRegion.show(this.editor);
                    addEditorCommands(this.editor);
                },
                initLint: function ()
                {
                    var self = this;

                    this.lintList = new SimpleListView(
                        {
                            onSelected: function (el, model)
                            {
                                var error = model.get('error');
                                self.editor.clearSelection();
                                self.editor.moveCursorTo({ row: error.row, column: error.column });

                            }
                        });
                    this.on('changed', function (e)
                    {
                        // Limit auto-refresh of Lint errors to every 1/2 second
                        if (!self._scheduledLintRefresh && self._lintVisible)
                        {
                            self._scheduledLintRefresh = true;
                            setTimeout(function ()
                            {
                                self.updateLintList();
                                self._scheduledLintRefresh = false;
                            }, 1000);
                        }
                    });

                    this.lintRegion.show(this.lintList);

                },
                // Custom 
                getContent: function ()
                {
                    return this.editor && this.editor.getValue();
                },
                setContent: function (text, options)
                {
                    options = options || {};
                    if (!this.editor)
                        return this.initialContent = text;

                    var self = this;
                    setTimeout(function ()
                    {
                        self.editor.setValue(text);
                        if (options.clearUndo)
                        {
                            self.editor.getUndoManager().reset();
                        }
                    }, 0);

                },
                isDirty: function ()
                {
                    return this.editor.hasUndo();
                },
                setEditorTheme: function (theme)
                {
                    this.editor.setTheme(theme);
                },
                showSummaryBuilder: function ()
                {
                    this.showBuilder('summary');
                },
                showParametersBuilder: function ()
                {
                    this.showBuilder('parameters');
                },
                focus: function ()
                {
                    this.editor.focus();
                },
                showShortcuts: function()
                {
                    var self = this;
                    new ModalHelper().alert({
                        text: htmlShortcuts,
                        onClose: function ()
                        {
                            self.focus();
                        },
                        width: 700,
                        height: 500
                    });

                },
                showBuilder: function (builderType)
                {
                    var self = this;
                    var currentCursorPosition = this.editor.getCursorPosition();
                    var functionName = 'get' + builderType.charAt(0).toUpperCase() + builderType.slice(1);
                    try
                    {
                        var result = ScriptHelper.select(this.editor, { type: 'FunctionDeclaration', id: functionName, matchFirst: true });
                    }
                    catch (e)
                    {
                        new ModalHelper().alert({
                            title: 'Error',
                            text: 'Unable to parse the script, please correct errors before using this helper',
                            onClose: function ()
                            {
                                self.focus();
                            }
                        });
                        return;
                    }
                    var data;
                    if (!this.editor.getSelection().isEmpty())
                    {
                        var selectionRange = this.editor.getSelectionRange();
                        var text = this.editor.getTextRange(selectionRange);
                        var data;
                        try
                        {
                            data = eval(text + '\n ' + functionName + '()');
                        }
                        catch (e)
                        {
                            new ModalHelper().alert({
                                title: 'Error',
                                text: 'Unable to parse the function properly, please check the indentation and correct any errors',
                                onClose: function ()
                                {
                                    self.focus();
                                }
                            });
                            return;

                        }
                        self.editor.clearSelection();
                        self.editor.moveCursorTo(currentCursorPosition);
                    }
                    App.execute('components:get', ['xemware.nimblescript.component.script' + builderType + 'builder'], function (err, Components)
                    {
                        if (builderType == 'parameters')
                        {
                            App.request('scripts:getmanager').parseParameters(data.params, function (collection)
                            {
                                show({ params: collection });
                            })

                        }
                        else
                            show({ data: data });
                        function show(options)
                        {
                            Components[0].showModal(_.extend({
                                onOK: function (replace, retObject, text)
                                {
                                    if (replace)
                                        self.replaceFunction(functionName, text);
                                    else
                                        self.editor.appendText(text);
                                    self.focus();
                                },
                                onCancel: function ()
                                {
                                    self.focus();
                                }}, options));
                        }
                    });

                },
                replaceFunction: function (functionName, newText)
                {
                    var numReplaces = ScriptHelper.replace(this.editor, newText, { type: 'FunctionDeclaration', id: functionName, matchFirst: true });
                    if (!numReplaces)
                        this.editor.appendText(newText);
                },
                toggleLint: function (visible)
                {
                    visible = this._lintVisible = !_.isUndefined(visible) ? visible : !this._lintVisible;

                    var editorWidth = visible ? '62%' : '100%';
                    var lintDisplay = visible ? 'block' : 'none';

                    this.editorRegion.$el.css('width', editorWidth);
                    this.ui.lintSection.css('display', lintDisplay);
                    if (visible)
                        this.updateLintList();
                },
                updateLintList: function ()
                {
                    var collection = this.lintList.collection;
                    var models;
                    if (this.editor.hasWorker())
                    {
                        models = _.map(this.editor.getAnnotations(), function (annotation)
                        {
                            return {
                                text: '(' + (annotation.row + 1) + ',' + (annotation.column + 1) + '): ' + annotation.text,
                                error: annotation
                            }
                        });

                    }
                    else
                    {
                        var lintResult = ScriptHelper.lint(this.editor.getValue());
                        models = _.map(lintResult.errors, function (error)
                        {
                            return {
                                text: '(' + error.line + ',' + error.character + '): ' + error.reason,
                                error: {
                                    row: error.line - 1,
                                    column: error.character - 1,
                                    text: error.reason
                                }
                            };

                        });
                    }
                    collection.set(models);
                },
                cut: function (options)
                {

                },
                copy: function (options)
                {

                },
                paste: function (options)
                {

                },
                undo: function ()
                {
                    return this.editor.undo();
                },
                redo: function ()
                {
                    return this.editor.redo();
                },
                canUndo: function ()
                {
                    return this.editor.hasUndo();
                },
                canRedo: function ()
                {
                    return this.editor.hasRedo();
                }
            }

        )

        // Hack to execute global keyboard commands - thanks Ace..
        function addEditorCommands(editor)
        {
            var documentManager = App.request('documents:getmanager');
            // TODO: Review handling this as it duplicates Mousetrap handlers
            var self = this;
            editor.addCommands([{
                name: 'save',
                bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
                exec: function (editor)
                {
                    documentManager.actionDocuments('save', null, true);
                }
            },
            {
                name: 'saveas',
                bindKey: { win: 'Ctrl-Shift-S', mac: 'Command-Shift-S' },
                exec: function (editor)
                {
                    documentManager.actionDocuments('saveas', null, false);
                }
            },
            {
                name: 'close',
                bindKey: { win: 'Alt-W', mac: 'Command-W' },
                exec: function (editor)
                {
                    documentManager.closeActive();
                }
            },
            {
                name: 'close',
                bindKey: { win: 'Alt-W', mac: 'Command-W' },
                exec: function (editor)
                {
                    documentManager.closeActive();
                }
            }]);
        }

    }



)
