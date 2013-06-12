define(['require', 'backbone','marionette', 'App', 'logger', './ScriptRunnerView','./ScriptRunnerModal'],
    function (require, Backbone,Marionette, App, Logger, ScriptRunnerView,ScriptRunnerModal)
    {
        "use strict"

        return {
            createView: function (options)
            {
                return new ScriptRunnerView(options);
            },
            createSectionView: function(sectionName, callback, options)
            {
                require(['./sections/' + _.capitalize(sectionName) + 'View'], function (SectionView)
                {
                    callback(SectionView && new SectionView(options) || null);
                });
            },
            showModal: function (options)
            {
                var modal = new ScriptRunnerModal(options);
                modal.show();
                return modal;

            }
        }
    }
)
