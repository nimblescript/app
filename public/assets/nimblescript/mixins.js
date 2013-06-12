define(['underscore', 'backbone'],
    function (_, Backbone)
    {
        "use strict"
        _.mixin({
            toUnixPath: function (s)
            {
                return s.replace(/\\/g, "/");
            },
            inherit: function (a, b)
            {
                var Constr = function () { };
                Constr.prototype = a.prototype;
                b.prototype = new Constr();
                b.prototype.constructor = b;
            },
            argsToArray: function (args, startIndex)
            {
                return _.toArray(args).slice(startIndex || 0);
            },
            compactObject: function (o, deep)
            {
                var ocopy = _.clone(o, true);
                deep = _.isBoolean(deep) ? deep : false;
                _.each(ocopy, function (value, key)
                {
                    if ((_.isString(value) && _.isEmpty(value)) ||
                        _.isUndefined(value) || _.isNaN(value) || _.isNull(value))
                        delete ocopy[key];
                });
                return ocopy;
            },
            capitalize: function (a)
            {
                return a[0].toUpperCase() + a.slice(1);
            },
            deepResult: function (o, path)
            {
                var pathParts = path.split('.');
                var currentO = o, retValue;
                _.each(pathParts, function (part, i)
                {
                    if (i == pathParts.length - 1)
                    {
                        retValue = _.result(currentO, part);
                        return false;
                    }

                    currentO = _.result(currentO, part);
                    if (!_.isObject(currentO))
                        return false;

                })
                return retValue;
            },
            normalizeNewlines: function (text)
            {
                return text.replace(/(\r\n|\r|\n)/g, '\r\n');
            }
        });
        _.extend(Backbone.Events.prototype,
            {
                customTrigger: function (parentType, eventName)
                {
                    var args = Array.prototype.slice.call(arguments, 2);
                    this.trigger.apply(this, [parentType, eventName].concat(args));
                    this.trigger.apply(this, [parentType + ':' + eventName].concat(args));
                }
            })
        if (!String.prototype.endsWith)
        {
            Object.defineProperty(String.prototype, 'endsWith', {
                enumerable: false,
                configurable: false,
                writable: false,
                value: function (searchString, position)
                {
                    position = position || this.length;
                    position = position - searchString.length;
                    return this.lastIndexOf(searchString) === position;
                }
            });
        }
    }
)
