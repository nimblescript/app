define(['underscore', 'backbone'],
    function (_, Backbone)
    {
        function Section()
        {

        }

        Section.extend = Backbone.Model.extend;

        _.extend(Section.prototype, Backbone.Events,
            {
                init: function()
                {

                },
                shutdown: function()
                {

                },
                sectionId: function ()
                {
                    throw new Error('Not implemented');
                },
                title: function ()
                {
                    return "Section";
                },
                parentSectionId: function()
                {
                    
                },
                beforeSave: function ()
                {
                },
                beforeSectionChange: function(currentSection, newSection)
                {

                },
                save: function ()
                {

                },
                beforeClose: function()
                {

                },
                close: function()
                {

                },
                isDirty: function ()
                {
                    return false;
                },
                renderContent: function (options)
                {
                    return null;
                },
                validate: function ()
                {
                    return true;
                }
            })
        Section.addToClass= function(obj)
        {
            _.defaults(obj.prototype, Section.prototype);
        }

        return Section;
    });

    
