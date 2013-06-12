define(['underscore', 'backgrid-paginator'],
    function (_,BackgridExtensionPaginator)
    {
        var a = BackgridExtensionPaginator.extend({
            tagName: 'div',
            className: 'table-pager',
            windowSize: 5,

            template: _.template('<div class="pagination pagination-centered"><ul><% _.each(handles, function (handle) { %><li data-action="<%= handle.action %>" <% if (handle.className) { %>class="<%= handle.className %>"<% } %>><a href="#" <% if (handle.title) {%> title="<%= handle.title %>"<% } %>><%= handle.label %></a></li><% }); %></ul></div>'),
            events: {
                "click a": function (e)
                {
                    e.preventDefault();
                    if (!$(e.target).parent().hasClass('disabled'))
                        this.changePage(e);
                }
            },
            initialize: function (options)
            {
                
                var opts = _.defaults({}, options, { pager_type: 'client', label_mode: 'full' });
                this.fastForwardHandleLabels =
                    {
                        next: opts.label_mode == 'full' ? 'Next' : '>',
                        prev: opts.label_mode == 'full' ? 'Prev' : '<',
                        first: 'First',
                        last: opts.pager_type != 'infinite' ? 'Last' : null
                    }
                this.windowSize = opts.windowSize || this.windowSize;
                BackgridExtensionPaginator.prototype.initialize.call(this, options);
            },
            makeHandles: function ()
            {
                var handles = [];
                var collection = this.collection;
                var state = collection.state;

                // convert all indices to 0-based here
                var lastPage = state.firstPage === 0 ? state.lastPage : state.lastPage - 1;
                var currentPage = state.firstPage === 0 ? state.currentPage : state.currentPage - 1;
                var windowStart = Math.floor(currentPage / this.windowSize) * this.windowSize;
                var windowEnd = windowStart + this.windowSize;
                windowEnd = windowEnd <= lastPage ? windowEnd : lastPage + 1;

                if (collection.mode !== "infinite") {
                    for (var i = windowStart; i < windowEnd; i++) {
                        handles.push({
                            label: i + 1,
                            title: "No. " + (i + 1),
                            className: currentPage === i ? "active" : undefined
                        });
                    }
                }

                var ffLabels = this.fastForwardHandleLabels;
                if (ffLabels) {

                    if (ffLabels.prev) {
                        handles.unshift({
                            label: ffLabels.prev,
                            action: 'prev',
                            className: collection.hasPrevious() ? void 0 : "disabled"
                        });
                    }

                    if (ffLabels.first) {
                        handles.unshift({
                            label: ffLabels.first,
                            action: 'first',
                            className: collection.hasPrevious() ? void 0 : "disabled"
                        });
                    }

                    if (ffLabels.next) {
                        handles.push({
                            label: ffLabels.next,
                            action: 'next',
                            className: collection.hasNext() ? void 0 : "disabled"
                        });
                    }

                    if (ffLabels.last) {
                        handles.push({
                            label: ffLabels.last,
                            action: 'last',
                            className: collection.hasNext() ? void 0 : "disabled"
                        });
                    }
                }
                return handles;
            },
            render: function ()
            {
                return BackgridExtensionPaginator.prototype.render.apply(this, arguments);
            }
        });
        return a;
    });