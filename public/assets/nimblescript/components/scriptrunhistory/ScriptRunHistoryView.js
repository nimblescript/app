define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', 'text!./scriptrunhistory.html', 'select2/select2', 'moment',
    'css!./scriptrunhistory'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, scriptRunHistoryHtml, $select2, moment)
    {
        "use strict"

        return Marionette.ItemView.extend(
            {
                template: Swig.compile(scriptRunHistoryHtml),
                tagName: 'div',
                className: 'script-run-history',
                ui: {
                    runHistory: 'select'
                },
                events:
                    {
                        'click a[data-action=run]': 'run',
                        'click a[data-action=open]': 'open'
                    },
                onRender: function ()
                {
                    this.ui.runHistory.select2();
                    this.populateRunHistory();
                },
                initialize: function ()
                {
                    this._scriptManager = App.request('scripts:getmanager');
                    this._fileSystemManager = App.request('filesystem:getmanager');
                    this.listenTo(this._scriptManager, 'script:run:after', this.onScriptRun);
                },
                populateRunHistory: function ()
                {
                    var self = this;
                    var currentVal = this.ui.runHistory.val();
                    this.ui.runHistory.empty();
                    this._scriptManager.loadRunHistory(function (err, history)
                    {
                        if (history)
                        {
                            _.each(history, function (historyItem, index)
                            {
                                var timestamp = historyItem.timestamp.match(/(.*)\./)[1];
                                var label = self._fileSystemManager.filename(historyItem.scriptpath) + ' - ' + moment(historyItem.timestamp).format('M/D/YYYY h:mm:ss a');
                                self.ui.runHistory.addSelectOption(label, index, false, { item: historyItem });
                            });
                            self.ui.runHistory.select2();
                        }
                    });
                },
                onScriptRun: function (e)
                {
                    if (e.response && e.response.success)
                        this.populateRunHistory();
                },
                run: function ()
                {
                    this.action(true);
                },
                open: function ()
                {
                    this.action(false);
                },
                action: function (run)
                {
                    var historyItem = this.ui.runHistory.children('option:selected').data('item');
                    if (historyItem)
                        this._scriptManager.openScript(historyItem.scriptpath, {
                            settings: { run: run, paramValues: historyItem.params, runSettings: historyItem.runsettings },
                            viewOptions: { showDetails: true, showParameters: true }
                        });
                }
            });
    }
)
