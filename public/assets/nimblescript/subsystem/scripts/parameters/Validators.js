define(function (require)
{

    return {
        regexValidator: function(value, formValues)
        {
            try
            {
                var r = new RegExp(value);
            }
            catch (e)
            {
                return {
                    type: 'regexp',
                    message: 'Not a valid regular expression'
                }
            }
        },
        createRegexValidator: function(expression, noMatchMessage)
        {
            return function (value, formValues)
            {
                if (!new RegExp(expression).test(expression))
                    return {
                        type: 'regexp',
                        message: noMatchMessage
                    }
            }
        },
        createLengthValidator: function(allowNull, minLength, maxLength)
        {
            var _minLength = parseInt(minLength), 
                _maxLength = parseInt(maxLength);
            return function (value, formValues)
            {
                var message;
                if (!allowNull && _.isEmpty(value))
                    message = 'Please specify a value';
                else if (_.isString(value) && _.isNumber(_minLength) && value.length < _minLength )
                    message = 'Minimum length of ' + minLength;
                else if (_.isString(value) && _.isNumber(_maxLength) && value.length > _maxLength)
                    message = 'Maximum length of ' + minLength;

                if (message)
                    return {
                        type: 'length',
                        message: message
                    }
            }
        },
        createSelectValidator: function(allowNull, minLength, maxLength)
        {
            var _minLength = parseInt(minLength),
                _maxLength = parseInt(maxLength);
            return function (value, formValues)
            {
                var message;
                if (!allowNull && _.isEmpty(value))
                    message = 'Required';
                else if (_.isNumber(_minLength) && value.length < _minLength)
                    message = 'Select at least ' + _minLength + ' items';
                else if (_.isNumber(_maxLength) && value.length > _maxLength)
                    message = 'Maximum of ' + _maxLength + ' items';

                if (message)
                    return {
                        type: 'length',
                        message: message
                    }
            }
        },
        createNumberValidator: function(allowNull, integerOnly, minValue, maxValue)
        {
            var _minValue = integerOnly ? parseInt(minValue) : parseFloat(minValue),
                _maxValue = integerOnly ? parseInt(maxValue) : parseFloat(maxValue);

            return function(value,formValues)               
            {
                var message;
                if (!allowNull && !_.isNumber(value))
                    message = 'You must specify ' + (integerOnly ? 'an integer' : 'a number');
                else if (integerOnly && Math.round(value) != Number(value))
                    message = 'You must specify an integer';
                else if (_.isNumber(_minValue) && value < _minValue)
                    message = 'Minimum of ' + minValue;
                else if (_.isNumber(_maxValue) && value > _maxValue)
                    message = 'Maximum of ' + maxValue;

                if (message)
                    return {
                            type: 'integer',
                            message: message
                        }
            }
        }

    }
});