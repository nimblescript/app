define(['require', 'jquery','underscore','jquery.cookie'],
    function (require, $,_, $cookie)
    {
        "use strict"

        function Cookie()
        {
        }
        _.extend(Cookie.prototype, {
            set: function ()
            {
                $.cookie.apply($, arguments);
            },
            get: function (name)
            {
                return $.cookie(name);
            }
        });

        return new Cookie();
    }
);
