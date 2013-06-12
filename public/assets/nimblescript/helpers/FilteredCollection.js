define(['marionette', 'backbone', 'Vent'],
    function(Marionette, Backbone, Vent)
{
        function FilteredCollection(original)
        {
            var filtered = new original.constructor();

            // allow this object to have it's own events
            filtered._callbacks = {};

            // call 'where' on the original function so that
            // filtering will happen from the complete collection
            filtered.where = function (criteria)
            {
                var items;

                // call 'where' if we have criteria
                // or just get all the models if we don't
                if (criteria)
                {
                    items = original.where(criteria);
                } else
                {
                    items = original.models;
                }

                // store current criteria
                filtered._currentCriteria = criteria;

                // reset the filtered collection with the new items
                filtered.reset(items);
            };


            // when the original collection is reset,
            // the filtered collection will re-filter itself
            // and end up with the new filtered result set
            original.on("reset", function ()
            {
                filtered.where(filtered._currentCriteria);
            });

            return filtered;
        }

        return FilteredCollection;
});
