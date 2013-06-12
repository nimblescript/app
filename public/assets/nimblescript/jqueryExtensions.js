define(['App', 'jquery'],
    function (App, $)
    {
        "use strict";
        /*!
            * toggleAttr() jQuery plugin
            * @link http://github.com/mathiasbynens/toggleAttr-jQuery-Plugin
            * @description Used to toggle selected="selected", disabled="disabled", checked="checked" etc…
            * @author Mathias Bynens <http://mathiasbynens.be/>
            */
        $.fn.toggleAttr = function (attr)
        {
            return this.each(function ()
            {
                var $this = $(this);
                $this.attr(attr) ? $this.removeAttr(attr) : $this.attr(attr, attr);
            });
        };

        $.fn.addSelectOption = function (label, value, setSelected, data)
        {
            return this.each(function ()
            {
                var o = $(this).children('option[value="' + value + '"]');
                if (o.length == 0)
                {
                    var opt = new Option(label, value);
                    this.options[this.options.length] = opt;
                    o = $(opt);
                }
                if (setSelected)
                {
                    o.attr('selected', 'selected');
                }
                if (typeof data != 'undefined')
                    o.data(data);

                return o;
            });
        }

        $.fn.buttonDisable = function (text)
        {
            return this.each(function ()
            {
                if (text)
                    $(this).attr('data-loading-text', text);
                else
                    $(this).attr('data-loading-text', $(this).text());
                $(this).button('loading');

            });
        }

        $.fn.buttonEnable = function ()
        {
            return this.each(function ()
            {
                $(this).button('reset');
            });
        }

        var _oldAttr = $.fn.attr;
        $.fn.attr = function ()
        {
            var a, aLength, attributes, map;
            if (this[0] && arguments.length === 0)
            {
                map = {};
                attributes = this[0].attributes;
                aLength = attributes.length;
                for (a = 0; a < aLength; a++)
                {
                    map[attributes[a].name.toLowerCase()] = attributes[a].value;
                }
                return map;
            } else
            {
                return _oldAttr.apply(this, arguments);
            }
        }

    }
)