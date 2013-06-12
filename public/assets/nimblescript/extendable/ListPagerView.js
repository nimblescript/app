define(['marionette', 'backbone', 'Vent', 'underscore', 'backgrid',
    'helpers/Backgrid.Extensions.Paginator', 'backgrid-moment-cell', 'helpers/Backgrid.ActionsColumn'],
function (Marionette, Backbone, Vent, _, Backgrid, FooterPaginator, MomentCell, ActionsColumn)
{
    "use strict";

    return Marionette.ItemView.extend({
        initialize: function (options)
        {
            var opts = _.defaults({}, options, { 
                link_id: null, link_type: null, label_mode: 'full', pager_type: 'client', list_title: '', columns: [], window_size: 5 });
            var masterCollection = this.collection &&
                _.clone(this.collection.models);
            this.collection = new opts.collection_object(
                masterCollection,
                {
                    link_id: opts.link_id,
                    link_type: opts.link_type
                });
            this.label_mode = opts.label_mode;
            this.pager_type = opts.pager_type;
            this.window_size = opts.window_size;

            _.extend(this, { templateHelpers: { list_title: opts.list_title } });
            Marionette.ItemView.prototype.initialize.apply(this, arguments);
        },
        onRender: function ()
        {
            var self = this;
            if (!this.collection.length)
            {
                this.collection.getFirstPage().complete(function ()
                {
                    doRender();
                });
            }
            else
                doRender();

            function doRender()
            {
                var pageableGrid = new Backgrid.Grid({
                    columns: self.columns,
                    collection: self.collection
                });
                var footer = new FooterPaginator({
                    columns: self.columns,
                    collection: self.collection,
                    windowSize: self.window_size,
                    pager_type: self.pager_type,
                    label_mode: self.label_mode
                });

                self.$el.find('.box-body .table-container').append(pageableGrid.render().$el);
                self.$el.find('.box-body').append(footer.render().$el);
            }

        }


    });
});

