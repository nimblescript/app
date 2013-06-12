define(['require', 'jquery','underscore'],
    function (require, $,_)
    {
        "use strict"

        function Translate()
        {
        }
        _.extend(Translate.prototype, {
            t: function ()
            {
                return $.t.apply($, arguments);
            }
        });

        return new Translate();
    }
);
