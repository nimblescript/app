define(['require','App', 'logger','./AddressBarView'],
    function (require, App, Logger, AddressBarView)
    {
        "use strict"

        return {
            createView: function (options)
            {
                return new AddressBarView(options);
            }
        }
    }
)
