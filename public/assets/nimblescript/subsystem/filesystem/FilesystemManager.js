define(['require', 'jquery', 'backbone', 'underscore', 'Vent', 'App', 'logger'],
    function (require, $, Backbone, _, Vent, App, Logger)
    {
        "use strict"

        function FileSystemManager()
        {

        }

        _.extend(FileSystemManager.prototype, Backbone.Events,
            {
                init: function (options)
                {
                    _.bindAll(this);
                    this.trigger('ready');
                },
                launchItem: function (path, options)
                {

                },
                getRootFolders: function (options, callback)
                {
                    options = _.extend({}, options);
                    App.serverCommand({
                        url: '/filesystem/rootfolders',
                        data: { restricted: options.restricted, dironly: options.dironly, checkboxes: options.selectionMode === 'multiple', scriptsdir: options.scriptsdir },
                        success: function (data)
                        {
                            callback && callback(null, data.items);
                        },
                        error: function (jqXHR, textStatus, errorThrown)
                        {
                            callback && callback(errorThrown);
                        }
                    });

                },
                getFolderContents: function (path, options, callback)
                {
                    options = _.extend({}, options);
                    App.serverCommand({
                        url: '/filesystem/' + encodeURIComponent(path) + '/foldercontents',
                        data: { dironly: options.dironly, checkboxes: options.selectionMode === 'multiple' },
                        success: function (data)
                        {
                            callback && callback(null, data.items);
                        },
                        error: function (jqXHR, textStatus, errorThrown)
                        {
                            callback && callback(errorThrown);
                        }
                    });

                },
                renameItem: function (path, newName, callback)
                {
                    var self = this;
                    return App.serverCommand({
                        url: '/filesystem/' + encodeURIComponent(path) + '/rename',
                        type: 'POST',
                        data: { newname: newName },
                        success: function (response)
                        {
                            if (response.newpath)
                                response.newpath = _.toUnixPath(response.newpath);

                            callback && callback(!response.success && response.reason, response);
                            if (response.success)
                                self.trigger('renamed', path, response.newname);
                        },
                        error: function (jqXHR, textStatus, errorThrown)
                        {
                            callback && callback(_.argsToArray(arguments));
                        }
                    });
                },
                deleteItem: function (path, callback)
                {
                    var self = this;
                    return App.serverCommand({
                        url: '/filesystem/' + encodeURIComponent(path),
                        type: 'DELETE',
                        success: function (response)
                        {
                            callback && callback(!response.success && response.reason, response);
                            if (response.success)
                                self.trigger('deleted', path)
                        },
                        error: function (jqXHR, textStatus, errorThrown)
                        {
                            callback && callback(_.argsToArray(arguments));
                        }
                    });

                },
                newFolder: function (path, callback)
                {
                    var self = this;
                    return App.serverCommand({
                        url: '/filesystem/' + encodeURIComponent(path) + '/newfolder',
                        type: 'POST',
                        success: function (response)
                        {
                            callback && callback(!response.success && response.reason, response);
                            if (response.success)
                                self.trigger('added', { path: _.toUnixPath(path), name: response.name, type: response.type, size: response.size, lastmodified: response.lastmodified });
                        },
                        error: function (jqXHR, textStatus, errorThrown)
                        {
                            callback && callback(_.argsToArray(arguments));
                        }
                    });

                },
                launch: function (path, callback)
                {
                    var self = this;
                    return App.serverCommand({
                        url: '/filesystem/' + encodeURIComponent(path) + '/launch',
                        type: 'POST',
                        success: function (response)
                        {
                            callback && callback(!response.success && response.reason, response);
                        },
                        error: function (jqXHR, textStatus, errorThrown)
                        {
                            callback && callback(_.argsToArray(arguments));
                        }
                    });

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
                formatSize: function (bytes, precision)
                {
                    precision = precision || 0;
                    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                    var posttxt = 0;
                    if (bytes == 0) return 'n/a';
                    while (bytes >= 1024)
                    {
                        posttxt++;
                        bytes = bytes / 1024;
                    }
                    return parseInt(bytes).toFixed(precision) + " " + sizes[posttxt];
                },

            })

        var fileSystemManager = new FileSystemManager();

        App.reqres.setHandler('filesystem:getmanager', function ()
        {
            return fileSystemManager;
        })

        return fileSystemManager;
    }
);