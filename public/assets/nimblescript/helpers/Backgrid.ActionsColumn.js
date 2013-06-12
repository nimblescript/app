define(['marionette', 'Vent', 'underscore', 'backgrid'],
    function (Marionette, Vent, _, Backgrid)
    {
        "use strict";
        return {
            name: 'actions',
            label: 'Actions',
            editable: false,
            sortable: false,
            cell: Backgrid.StringCell,
            headerCell: Backgrid.HeaderCell.extend(
            {
                render: function ()
                {
                    Backgrid.HeaderCell.prototype.render.call(this);
                    this.$el.addClass('actions');
                    return this;
                }
            })

        }

    }
    );