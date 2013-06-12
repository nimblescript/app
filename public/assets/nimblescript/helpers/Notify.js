define(['require', 'jquery', 'underscore', 'backbone', 'jquery.pnotify', 'css!lib/pnotify/jquery.pnotify.default', 'css!lib/pnotify/jquery.pnotify.default.icons'],
    function (require, $, _, Backbone, $pnotify, css1, css2)
    {
        "use strict";

        function NotifyWrapper(notify)
        {
            this._notify = notify;
        }

        _.extend(NotifyWrapper.prototype, Backbone.Events,
            {
                update: function (options)
                {
                    this._notify.pnotify(options);
                },
                remove: function ()
                {
                    this._notify.pnotify_remove();
                }
            })

        var stack_bar_top = { "dir1": "down", "dir2": "right", "push": "top", "spacing1": 0, "spacing2": 0 };

        return {
            notify: function (options)
            {
                return new NotifyWrapper($.pnotify(options));
            },
            loading: function (options)
            {
                var modal_overlay;
                var opts = _.extend({}, options, {
                    history: false,
                    animation: 'none',
                    // stack: false,
                    hide: false,
                    nonblock: true,
                    sticker: false,
                    mouse_reset: false,
                    stack: stack_bar_top,
                    before_open: function (pnotify)
                    {
                        // Position this notice in the center of the screen.
                        pnotify.css({
                            "top": 20,
                            // "top": ($(window).height() / 2) - (pnotify.height() / 2),
                            "left": ($(window).width() / 2) - (pnotify.width() / 2)
                        });
                        // Make a modal screen overlay.
                        if (modal_overlay) modal_overlay.fadeIn("none");
                        else modal_overlay = $("<div />", {
                            "class": "ui-widget-overlay",
                            "css": {
                                "display": "none",
                                "position": "fixed",
                                "top": "0",
                                "bottom": "0",
                                "right": "0",
                                "left": "0"
                            }
                        }).appendTo("body").fadeIn("none");
                    },
                    before_close: function ()
                    {
                        modal_overlay.fadeOut("fast");
                    }

                });
                return this.notify(opts);
            }
        }

    }
);
