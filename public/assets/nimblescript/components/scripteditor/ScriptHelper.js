
define(['underscore', 'acorn', 'acorn-loose', 'jshint'],
    function (_,Acorn,AcornLoose,JSHINT)
    {
        /* Hack for JSHINT embedded EVentEmitter */
        if (!console.trace)
            console.trace = function ()
            {
                console.log.apply(this, Array.prototype.slice.call(arguments, 0));
            }

        return {
            lint: function(content, options)
            {
                options = _.defaults({}, options, {
                    asi: true, eqnull: true, es5: true, laxbreak: true, laxcomma: true, onecase: true, smarttabs: true, sub: true, supernew: true, node: true, noarg: true, globalstrict: false,
                    strict: false, multistr: true
                });
                JSHINT(content, options);
                return JSHINT.data();
            },
            select: function (editor,options)
            {
                editor.getSelection().clearSelection();
                var text = editor.getValue();
                var nodes = find(text, options);
                _.each(nodes, function(node)
                {
                    editor.getSelection().addRange(editor.createRange(node.loc.start.line - 1, node.loc.start.column, node.loc.end.line - 1, node.loc.end.column));
                })
            },
            replace: function (editor, newText, options)
            {
                var text = editor.getValue();
                var nodes = find(text, options);
                _.each(nodes, function (node)
                {
                    var range = editor.createRange(node.loc.start.line - 1, node.loc.start.column, node.loc.end.line - 1, node.loc.end.column);
                    editor.getSession().replace(range, newText);
                })
                return nodes.length;

            }
        }


        function find(text, options)
        {
            var nodes;
            try
            {
                var syntax = Acorn.parse(text, { locations: true});
                nodes = findNodes(syntax, options);
            }
            catch (e)
            {
                try
                {
                    var syntax = AcornLoose.parse_dammit(text, { locations: true });
                    nodes = findNodes(syntax, options);
                }
                catch (e2)
                {
                    throw (e2);
                }
            }
            return nodes;
        }

        function findNodes(node, options)
        {
            options = options || {};
            
            var matchingNodes = [];
            var nodeStack = [];
            var currentNode = node;
            var numMatchProp = _.size(_.pick(options, 'type','id'));
            if (!numMatchProp) // nothing to match
                return ;

            while (currentNode)
            {
                var matchedProp = 0;
                if (options.type && currentNode.type == options.type)
                    matchedProp++;
                if (options.id && currentNode.id && currentNode.id.name == options.id )
                    matchedProp++;
                if (numMatchProp == matchedProp) // Matched all
                {
                    matchingNodes.push(currentNode);
                    if (options.firstMatch)
                        return matchingNodes;
                }
                
                if (currentNode.body && 
                    (currentNode.type == 'FunctionDeclaration' || currentNode.type == 'BlockStatement' || currentNode.type == 'Program' ))
                {
                    if (_.isArray(currentNode.body) )
                        nodeStack.push.apply(nodeStack, currentNode.body.slice(0));
                    else
                        nodeStack.push(currentNode.body);
                }
                    
                currentNode = nodeStack.pop();
            }
            return matchingNodes;
            
        }

        
    }
)
