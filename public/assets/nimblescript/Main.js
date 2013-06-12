define(['require', 'App', 'underscore', 'jquery','backbone', 'controllers/AppController', 'routers/AppRouter',
    'i18n', 'vent', 'logger', 'bootstrap', 'async', 'jqueryExtensions', 'mixins', 'jquery.blockui', 'modalhelper', 'translate'],
    function (require, App, _, $, Backbone, Controller, Router, i18n, Vent, Logger, Bootstrap, async, $extensions, _mixins, $jqueryblockui, ModalHelper, t)
    {
        "use strict";
        // Must be done before initializers as the renderer depends on it and other initializers may need a render
        initi18n();

        App.addInitializer(function (options)
        {
            new Router({
                controller: Controller
            });
            Backbone.history.start();

        });

        App.on('initialize:after', function (options)
        {
            App.execute('app:init', options);
        })


        // Initializing stuff 
        // TODO: Refactor with more robust design
        var baseModules = ['subsystem/user/User', 'subsystem/ui/UIManager'];
        var signedInModules = [
            'subsystem/mainmenu/Menu',
            'subsystem/widgets/WidgetManager',
            'subsystem/documents/DocumentManager',
            'subsystem/modules/ModuleManager',
            'subsystem/components/ComponentManager',
            'subsystem/filesystem/FilesystemManager',
            'subsystem/repository/RepositoryManager',
            'subsystem/scripts/ScriptManager',
            'subsystem/clipboard/ClipboardManager',
            'subsystem/plugins/PluginManager',
            'subsystem/templates/TemplateManager'


        ];

        function hookSubsystemEvents()
        {
            var userManager = App.request('user:getmanager');
            if (userManager)
            {
                userManager.on('signedin', function ()
                {
                    reload();
                })
                userManager.on('userinit', function ()
                {
                    reload();
                })

            }

        };

        App.commands.setHandler('system:shutdown', function ()
        {
            App.shutdown().done(
                function ()
                {
                    new ModalHelper().alert({ title: t.t('misc.shutdown_title') + '...', text: t.t('misc.shutdown_text') });
                }
            );
        });

        App.commands.setHandler('system:signout', function ()
        {
            var userManager = App.request('user:getmanager');
            userManager.signOut(function (callback)
            {
                reload();
            });
        });
        App.on('subsystems:loaded', function (isFirstTime, isLoggedIn)
        {
            Logger.debug('subsystems loaded');
            // debugger;
            $('body').i18n();
            hookSubsystemEvents();
            async.waterfall([
                function loadSettings(cb)
                {
                    App.execute('settings:get', function (settings)
                    {
                        App.execute('ui:set-theme', settings.ui.theme);
                        cb()
                    })

                },
                function run(cb)
                {
                    if (isFirstTime)
                    {
                        require(['subsystem/firsttime/FirstTimeView'], function (FirstTimeView)
                        {
                            App.main.show(new FirstTimeView({ model: new Backbone.Model() }));
                            cb();
                        })
                    }
                    else
                    {
                        if (isLoggedIn)
                        {
                            require(['subsystem/mainview/MainView'], function (MainView)
                            {
                                var mainView = new MainView({ model: new Backbone.Model() });
                                App.main.show(mainView);
                                cb();
                            })
                        }
                        else
                        {
                            var userManager = App.request('user:getmanager');
                            userManager.showSignIn();
                            cb();
                        }
                    }
                }
            ], function complete()
            {
                $.unblockUI();
            })

        });

        App.commands.setHandler('app:init', function (options)
        {
            $.blockUI({ message: '<div class="please-wait">nimbleScript is loading...</div>', fadeIn: 0, fadeOut: 0 });

            App.execute('app:subsystems:load', options);
        })

        App.commands.setHandler('app:subsystems:load', function (options)
        {
            loadSubsystems();
        });

        function loadSubsystems()
        {
            Logger.debug('Loading subsystems');
            // Minimum plugins
            doRequireSubsystem(baseModules, function ()
            {
                var opts = _.extend({});
                var userManager = App.request('user:getmanager');
                async.series([
                    function isFirstTime(cb)
                    {
                        userManager.isFirstTime(function (result)
                        {
                            cb(null, result);
                        });
                    },
                    function isSignedIn(cb)
                    {
                        userManager.isSignedIn(function (result)
                        {
                            cb(null, result);
                        });

                    }
                ], function complete(err, results)
                {
                    console.log(results);
                    var isFirstTime = results[0], isLoggedIn = results[1];
                    if (!isFirstTime && isLoggedIn)
                    {
                        async.eachSeries([signedInModules, opts.plugin_paths], function (a, cb)
                        {
                            if (_.isArray(a))
                            {
                                doRequireSubsystem(a, function ()
                                {
                                    Logger.debug('loadsubsystems.itemcomplete', a);
                                    cb();
                                });
                            }
                            else
                                cb();
                        }, function ()
                        {
                            Logger.debug('loadsubsystems:complete');
                            done();
                        });
                    }
                    else
                        done();

                    function done()
                    {
                        App.trigger('subsystems:loaded', isFirstTime, isLoggedIn);
                    }

                })
            });
        }

        function doRequireSubsystem(paths, callback)
        {
            async.eachSeries(paths, function (path, cb)
            {
                Logger.debug('Requiring subsystem: ' + path);
                require([path], function (component)
                {

                    if (component && component.init)
                    {
                        component.on('ready', cb);
                        component.init();
                    }
                    else
                        cb();
                });
            }, callback);

        }

        // TODO: Migrate to locked down subsystem model instead of Vent/App handlers
        var SubsystemManager = function ()
        {
        }


        function initi18n()
        {
            var option = {
                resGetPath: '/locales/resources.json?lng=__lng__&ns=__ns__',
                dynamicLoad: true,
                getAsync: false,
                useDataAttrOptions: true
            };

            i18n.init(option);
        }


        function reload()
        {
            window.location.reload(true);
        }

        return App;


    });

