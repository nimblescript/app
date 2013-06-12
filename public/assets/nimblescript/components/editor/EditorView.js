define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', 'ace/ace', 'ace/range'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, Ace, AceRange)
    {
        "use strict"
        var settingsManager = App.request('settings:getmanager');
        return Marionette.ItemView.extend(
            {
                template: Swig.compile(''),
                tagName: 'div',
                className: 'editor',
                initialize: function (options)
                {
                    this.options = _.defaults({}, options, { mode: 'javascript', readonly: false, theme: settingsManager.lastUserSettings.ui.scriptEditorTheme });
                    this._hasWorker = false;
                },
                events: {
                },
                onRender: function ()
                {
                    this.initEditor();
                },
                onClose: function ()
                {
                    this.editor.destroy();
                },
                // Custom 
                initEditor: function ()
                {
                    var self = this;
                    var editorArea = this.$el.get(0);
                    this.editor = Ace.edit(editorArea);
                    this.editor.setBehavioursEnabled(true);
                    this.editor.setShowPrintMargin(false);
                    this.editor.setTheme(this.options.theme);
                    this.editor.setReadOnly(this.options.readonly);
                    this.editor.setValue(this.options.initialContent || '');
                    this.editor.getSelection().clearSelection();

                    this.editor.on('change', function (e)
                    {
                        // Introduce delay to let UndoManager catchup
                        setTimeout(function ()
                        {
                            self.trigger('changed');
                        }, 0)

                    });
                    var session = this.editor.getSession();
                    session.setMode('ace/mode/' + this.options.mode);

                    var UndoManager = require("ace/undomanager").UndoManager;
                    session.setUndoManager(new UndoManager());
                    session.getUndoManager().reset();
                    
                    session.on("changeAnnotation", function ()
                    {
                        var annot = session.getAnnotations();
                        self.trigger('annotations:changed', annot);
                    });
                    session.on('changeMode', function ()
                    {
                        self._hasWorker = !!self.getSession().$worker;
                        self.trigger('mode:changed');
                        
                    });
                },
                focus: function ()
                {
                    this.editor.focus();
                },
                isDirty: function ()
                {
                    return this.editor.getSession().getUndoManager().hasUndo();
                },
                setEditorTheme: function (theme)
                {
                    this.editor.setTheme(theme);
                },
                undo: function ()
                {
                    return this.editor.getSession().getUndoManager().undo();
                },
                redo: function ()
                {
                    return this.editor.getSession().getUndoManager().redo();
                },
                hasUndo: function ()
                {
                    return this.editor.getSession().getUndoManager().hasUndo();
                },
                hasRedo: function ()
                {
                    return this.editor.getSession().getUndoManager().hasRedo();
                },
                getSelection: function ()
                {
                    return this.editor.getSelection();
                },
                getSelectionRange: function ()
                {
                    return this.editor.getSelection().getRange();
                },
                getTextRange: function (range)
                {
                    return this.editor.getSession().getTextRange(range);
                },
                createRange: function (startRow, startCol, endRow, endCol)
                {
                    return new AceRange.Range(startRow, startCol, endRow, endCol);
                },
                getSession: function ()
                {
                    return this.editor.getSession();
                },
                getUndoManager: function ()
                {
                    return this.editor.getSession().getUndoManager();
                },
                getDocument: function ()
                {
                    return this.editor.getSession().getDocument();
                },
                getCursorPosition: function()
                {
                    return this.editor.getCursorPosition();
                },
                moveCursorTo: function()
                {
                    if (_.isObject(arguments[0]))
                        this.editor.moveCursorToPosition(arguments[0]);
                    else
                        this.editor.moveCursorTo(arguments[0], arguments[1]);

                },
                getValue: function ()
                {
                    return this.editor.getValue();
                },
                setValue: function (value)
                {
                    this.editor.setValue(value);
                },
                clearSelection: function ()
                {
                    this.editor.getSelection().toSingleRange();
                    this.editor.clearSelection();
                },
                appendText: function (text)
                {
                    var document = this.editor.getSession().getDocument();
                    document.insertNewLine({ row: document.getLength() });
                    document.insert({ row: document.getLength(), column: 0 }, text);
                },
                hasWorker: function ()
                {
                    return this._hasWorker;
                },
                getAnnotations: function ()
                {
                    return this.getSession().getAnnotations();
                },
                addCommands: function (commands)
                {
                    return this.editor.commands.addCommands(commands);
                }



            });
    }
)
