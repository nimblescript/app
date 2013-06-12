define(['require', 'mousetrap','underscore'],
    function (require, Mousetrap,_)
    {
        "use strict"

        function KeyboardShortcuts()
        {
            _.bindAll(this);
        }
        _.extend(KeyboardShortcuts.prototype, {
            bind: function ()
            {
                return Mousetrap.bind.apply(Mousetrap, _.toArray(arguments));
            },
            preventDefault: function (e)
            {
                if (e.preventDefault)
                {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                } else
                {
                    // internet explorer
                    e.returnValue = false;
                }
                return false;
            },
            setDisabled: function (disabled)
            {
                this._disabled = disabled;
            },
            isDisabled: function ()
            {
                return this._disabled;
            }

        });

        return new KeyboardShortcuts();
    }
);
