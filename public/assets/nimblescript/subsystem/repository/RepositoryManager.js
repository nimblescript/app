define(['jquery', 'underscore', 'Vent', 'App', 'logger', 'backbone','mousetrap'],
    function ($, _, Vent, App, Logger, Backbone,Mousetrap)
    {
        "use strict"

        var documentManager, fileSystemManager;
        App.on('subsystems:loaded', function ()
        {
            documentManager = App.request('documents:getmanager');
            fileSystemManager = App.request('filesystem:getmanager');
        })

        function RepositoryManager()
        {
            this._scripts = {};
            this._parameterTypes = {};
        }

        _.extend(RepositoryManager.prototype, Backbone.Events,
            {
                init: function (options)
                {
                    _.bindAll(this);
                    this.trigger('ready');
                },
                getItem: function(path, callback)
                {
                    this.itemCommand(path, 'get',function (err, result)
                    {
                        callback(err, result);
                    })
                },
                renameItem: function (path, newName, callback)
                {
                    var self = this;
                    this.itemCommand(path, 'rename', function (err, response)
                    {
                        callback && callback(err, response);
                        if (response && response.success)
                            self.trigger('item:renamed', path, newName)
                    }, { newname: newName});
                },
                saveItem: function(path, content, callback, options)
                {
                    options = options || {};
                    var self = this;
                    if (_.isEmpty(path) || !_.isString(content))
                    {
                        callback && callback('error'); // TODO
                        return false;
                    }

                    this.itemCommand(path, 'save', function (err,response)
                    {
                        callback && callback(err, response);
                        if (!err && response.actioned)
                            self.trigger('item:saved', response)
                    }, { content: content });
                    
                    return true;
                },
                deleteItem: function(path, callback, options)
                {
                    options = options || {};
                    var self = this;
                    if (_.isEmpty(path))
                    {
                        callback && callback('error'); // TODO
                        return false;
                    }

                    this.itemCommand(path, 'delete', function (err,response)
                    {
                        callback && callback(err, response);
                        if (!err && response.success)
                            self.trigger('item:deleted', path)
                    });
                    
                    return true;
                },
                itemCommand: function (path, command, callback,data)
                {
                    var type = 'GET';
                    var urlExtension = '/' + command;
                    switch (command)
                    {
                        case 'delete':
                            type = 'DELETE';
                            urlExtension = '';
                            break;
                        case 'get':
                            urlExtension = '';
                            break;
                        case 'save':
                            urlExtension = '';
                            type = 'PUT';
                            break;
                        case 'rename':
                        case 'newfolder':
                        case 'run':
                            type = 'POST';
                            break;

                    }
                    var url = '/repository/item/' + encodeURIComponent(path) + urlExtension;
                    return App.serverCommand({
                        notify: false,
                        url: url,
                        type: type,
                        data: data,
                        success: function (result)
                        {
                            callback(!result.success && result.message, result)
                        },
                        error: function ()
                        {
                            callback(Array.prototype.slice.call(arguments, 0));
                        }
                    })
                },
                getRepositories: function (thisUser, callback)
                {
                    return App.serverCommand({
                        url: '/repository/repositories',
                        data: { },
                        success: function (result)
                        {
                            callback(!result.success && result.message, result.repositories)
                        },
                        error: function ()
                        {
                            callback(_.toArray(arguments));
                        }
                    })
                },
                getFolderItems: function(path, callback)
                {
                    return App.serverCommand({
                        url: '/repository/item/' + encodeURIComponent(path) + '/children',
                        data: { fileFilter: JSON.stringify(['.*\\.ns']) },
                        success: function (result)
                        {
                            callback(!result.success && result.message, result.items)
                        },
                        error: function ()
                        {
                            callback(_.toArray(arguments));
                        }
                    })

                },
                filename: function (path)
                {
                    return _.toUnixPath(path).split('/').pop();
                },
                directory: function (path)
                {
                    var dir = _.initial(_.toUnixPath(path).split('/'));
                    if (_.last(dir) == ':')
                        dir += '/';
                    return dir.join('/');
                },
                newFolder: function (path, callback)
                {
                    var self = this;
                    this.itemCommand(path, 'newfolder', function (err, response)
                    {
                        callback && callback(err, response);
                        if (!err && response.success)
                            self.trigger('item:added', { path: path, name: response.name, type: 'folder', lastmodified: response.lastmodified, size: 0 })
                    });
                },
                externalItemAction: function (action,path, type)
                {
                    this.trigger('item:' + action, { path: path, name: fileSystemManager.filename(path), type: type, lastmodified: new Date(), size: 0 })
                }
            })

        var repositoryManager = new RepositoryManager();

        App.reqres.setHandler('repository:getmanager', function ()
        {
            return repositoryManager;
        });


        return repositoryManager;
    }
    );