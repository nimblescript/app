define(function (require, exports, module)
{
    "use strict"

    module.exports = function (register)
    {
        var _ = require('underscore')
            , Backbone = require('backbone')
            , App = require('App')
            , Logger = require('logger')

        Logger.debug('Testing plugin');
        init();

        register(
            {
                id: 'xemware.nimblescript.plugin.testing',
                about: function ()
                {
                    return "Adds Test menu"
                },
                version: function ()
                {
                    return "0.0.1"
                }
            }
        );


        function init()
        {
            addToMenu();
        }


        function addToMenu()
        {
            // return;
            var menuManager = App.request('menu:getmanager');
            var helpMenu = menuManager.findMenu('help');
            var helpPosition = menuManager.collection.models.indexOf(helpMenu);
            menuManager.collection.add([
            {
                "id": "Test",
                "label": "Test",
                "href": "#",
                "subitems": new Backbone.Collection(
                    [
                        {
                            "id": "test.components",
                            "label": "Components",
                            "href": "#",
                            "submenu": true,
                            "subitems": new Backbone.Collection(
					        [
						        {
						            "id": "test.component.folderbrowser",
						            "label": "Directory Browser",
						            "href": "#",
						            "command": "test:component:folderbrowser:create"
						        },
						        {
						            "id": "test.component.folderbrowsermodal",
						            "label": "Folder Browser Modal",
						            "href": "#",
						            "command": "test:component:folderbrowsermodal:create"
						        },
						        {
						            "id": "test.component.datatable",
						            "label": "DataTable",
						            "href": "#",
						            "command": "test:component:datatable:create"
						        },
						        {
						            "id": "test.component.fileexplorer",
						            "label": "File Explorer",
						            "href": "#",
						            "command": "test:component:fileexplorer:create"
						        },
						        {
						            "id": "test.component.fileexplorermodal.openfile",
						            "label": "File Explorer Modal - Open File",
						            "href": "#",
						            "command": "test:component:fileexplorermodal:openfile"
						        },
						        {
						            "id": "test.component.fileexplorermodal.savefile",
						            "label": "File Explorer Modal - Save File",
						            "href": "#",
						            "command": "test:component:fileexplorermodal:savefile"
						        },
						        {
						            "id": "test.component.repositoryexplorermodal.openfile",
						            "label": "Repository Explorer Modal - Open File",
						            "href": "#",
						            "command": "test:component:repositoryexplorermodal:open"
						        },
						        {
						            "id": "test.component.repositoryexplorermodal.savefile",
						            "label": "Repository Explorer Modal - Save File",
						            "href": "#",
						            "command": "test:component:repositoryexplorermodal:save"
						        },
						        {
						            "id": "test.component.repositorybrowser",
						            "label": "Script Browser",
						            "href": "#",
						            "command": "test:component:repositorybrowser:create"
						        },
						        {
						            "id": "test.component.repositorybrowsermodal",
						            "label": "Script Browser Modal",
						            "href": "#",
						            "command": "test:component:repositorybrowser:modal"
						        },
						        {
						            "id": "test.component.filelist",
						            "label": "File List",
						            "href": "#",
						            "command": "test:component:filelist:create"
						        },
						        {
						            "id": "test.component.filelisteditor",
						            "label": "File List Editor",
						            "href": "#",
						            "command": "test:component:filelisteditor:create"
						        },
						        {
						            "id": "test.component.scriptrunner",
						            "label": "Script Runner",
						            "href": "#",
						            "command": "test:component:scriptrunner:create"
						        },
						        {
						            "id": "test.component.scriptsummarybuilder",
						            "label": "Script Summary Builder",
						            "href": "#",
						            "command": "test:component:scriptsummarybuilder:create"
						        },
						        {
						            "id": "test.component.scriptparametersbuilder",
						            "label": "Script Parameters Builder",
						            "href": "#",
						            "command": "test:component:scriptparametersbuilder:create"
						        },
						        {
						            "id": "test.component.adddocument",
						            "label": "Add Document",
						            "href": "#",
						            "command": "test:document:add"
						        },
						        {
						            "id": "test.modalhelper.prompt",
						            "label": "Modal Prompt",
						            "href": "#",
						            "command": "test:modalhelper:prompt"
						        },
						        {
						            "id": "test.component.templatebrowsermodal",
						            "label": "Template Browser Modal",
						            "href": "#",
						            "command": "test:component:templatebrowsermodal:create"
						        },
						        {
						            "id": "test.component.publishscript.modal",
						            "label": "Publish Script Modal",
						            "href": "#",
						            "command": "test:component:publishscript:modal"
						        },
						        {
						            "id": "test.openscript.fail",
						            "label": "Open Script Fail",
						            "href": "#",
						            "command": "test:component:openscriptdocument:fail"
						        }
					        ])
                        }
                    ])
            }
            ], { at: helpPosition + 1 });

        }

        App.commands.setHandler('test:component:datatable:create', function ()
        {
            App.execute('components:get', ['xemware.nimblescript.component.datatable'], function (err, Components)
            {
                var columns = [{
                    name: "id", // The key of the model attribute
                    label: "ID", // The name to display in the header
                    editable: false, // By default every cell in a column is editable, but *ID* shouldn't be
                    // Defines a cell type, and ID is displayed as an integer without the ',' separating 1000s.
                    cell: "string"

                }, {
                    name: "name",
                    label: "Name",
                    // The cell type can be a reference of a Backgrid.Cell subclass, any Backgrid.Cell subclass instances like *id* above, or a string
                    cell: "string" // This is converted to "StringCell" and a corresponding class in the Backgrid package namespace is looked up
                }];

                var coll = new Backbone.Collection();
                for (var i = 0; i < 100; i++)
                    coll.add({ id: i, name: 'smee' })

                var view = Components[0].createView({ columns: columns, collection: coll });
                App.main.show(view);
                // view.updateColumnSizing();
            });
        });

        App.commands.setHandler('test:component:folderbrowser:create', function ()
        {
            App.execute('components:get', ['xemware.nimblescript.component.folderbrowser'], function (err, Components)
            {
                var view = Components[0].createView({ restricted: false });
                App.main.show(view);
                view.listenTo(view, 'node', function ()
                {
                });
            });
        });

        App.commands.setHandler('test:component:fileexplorer:create', function ()
        {
            App.execute('components:get', ['xemware.nimblescript.component.fileexplorer'], function (err, Components)
            {
                var view = Components[0].createView({ anchorToWindow: true, initialPath: 'C:/Development/Assemblies' });
                App.main.show(view);
            });
        });

        App.commands.setHandler('test:component:repositorybrowser:create', function ()
        {
            App.execute('components:get', ['xemware.nimblescript.component.repositorybrowser'], function (err, Components)
            {
                var view = Components[0].createView();
                App.main.show(view);
                view.listenTo(view, 'all', function ()
                {
                })
            });
        });

        App.commands.setHandler('test:component:repositorybrowser:modal', function ()
        {
            App.execute('components:get', ['xemware.nimblescript.component.repositorybrowser'], function (err, Components)
            {
                require(['modalhelper'], function (ModalHelper)
                {
                    var view = Components[0].createView();
                    var modalHelper = new ModalHelper();
                    modalHelper.view({ view: view });
                });
                
                
            });
        });

        App.commands.setHandler('test:component:filelist:create', function ()
        {
            App.execute('components:get', ['xemware.nimblescript.component.filelist'], function (err, Components)
            {
                var view = Components[0].createView();
                App.main.show(view);
                view.listenTo(view, 'all', function ()
                {
                })
            });
        });

        App.commands.setHandler('test:modalhelper:prompt', function ()
        {
            require(['modalhelper'], function (ModalHelper)
            {
                var modal;
                new ModalHelper().prompt({
                    title: 'Save as...',
                    text: 'Please enter a valid filename:',
                    onButton: function (text)
                    {
                        if (text == 'OK')
                        {
                            var name = modal.find('input.active').val();
                            var r = /[A-Za-z\-_\s0-9]+/;
                            if (true)
                                new ModalHelper().alert({ title: 'Error...', text: 'Only following characters are supported:<br/> A-Z, a-z, 0-9, _, -, and spaces' });

                        }
                        return false;
                    },
                    onCreate: function (m)
                    {
                        modal = m;
                    }
                });
            });
        });


        App.commands.setHandler('test:component:filelisteditor:create', function ()
        {
            App.execute('components:get', ['xemware.nimblescript.component.filelisteditor'], function (err, Components)
            {
                var view = Components[0].createView();
                App.main.show(view);
            });
        });

        App.commands.setHandler('test:component:fileexplorermodal:savefile', function ()
        {
            App.execute('components:get', ['xemware.nimblescript.component.fileexplorer'], function (err, Components)
            {
                var modal = Components[0].showModal({
                    mode: 'saveFile', overwritePrompt: true,
                    // initialFilename: 'smoo.js',
                    initialPath: 'C:/Development/Assemblies', allowedItems: ['file'],
                    onOK: function (selectedItems)
                    {
                        console.log(modal.getFilename());
                        console.log(modal.getDirectory());
                        console.log(selectedItems[0].key);
                        return true;
                    }
                });
            });
        });

        App.commands.setHandler('test:component:fileexplorermodal:openfile', function ()
        {
            App.execute('components:get', ['xemware.nimblescript.component.fileexplorer'], function (err, Components)
            {
                var modal = Components[0].showModal({
                    mode: 'openFile',
                    deleteConfirm: true,
                    // initialFilename: 'smoo.js',
                    initialPath: 'U:/Archive/Development', allowedItems: ['file'],
                    onOK: function (selectedItems)
                    {
                        console.log(modal.getFilename());
                        console.log(modal.getDirectory());
                        console.log(selectedItems[0].key);
                        return true;
                    }
                });
            });
        });

        App.commands.setHandler('test:component:repositoryexplorermodal:save', function ()
        {
            App.execute('components:get', ['xemware.nimblescript.component.repositoryexplorer'], function (err, Components)
            {
                var modal = Components[0].showModal({
                    mode: 'save', overwritePrompt: true,
                    // initialFilename: 'smoo.js',
                    onOK: function (selectedItems)
                    {
                        console.log(modal.getFilename());
                        console.log(modal.getDirectory());
                        console.log(selectedItems);
                        return true;
                    }
                });
            });
        });

        App.commands.setHandler('test:component:repositoryexplorermodal:open', function ()
        {
            App.execute('components:get', ['xemware.nimblescript.component.repositoryexplorer'], function (err, Components)
            {
                var modal = Components[0].showModal({
                    mode: 'open',
                    deleteConfirm: true,
                    onOK: function (selectedItems)
                    {
                        console.log(modal.getFilename());
                        console.log(modal.getDirectory());
                        console.log(selectedItems);
                        return true;
                    }
                });
            });
        });

        App.commands.setHandler('test:component:templatebrowsermodal:create', function ()
        {
            App.execute('components:get', ['xemware.nimblescript.component.templatebrowser'], function (err, Components)
            {
                Components[0].showModal({
                    title: 'New Script...',
                    onOK: function (content)
                    {
                        return true;
                    }
                });
            });
        });

        App.commands.setHandler('test:component:folderbrowsermodal:create', function ()
        {
            App.execute('components:get', ['xemware.nimblescript.component.folderbrowser'], function (err, Components)
            {
                Components[0].showModal({
                    selectionMode: 'multiple',
                    onOK: function (selectedItems)
                    {
                        alert(selectedItems[0].key);
                        return true;
                    }
                });
            });
        });

        App.commands.setHandler('test:component:scriptsummarybuilder:create', function ()
        {
            App.execute('components:get', ['xemware.nimblescript.component.scriptsummarybuilder'], function (err, Components)
            {
                Components[0].showModal();
            });
        });

        App.commands.setHandler('test:component:scriptparametersbuilder:create', function ()
        {
            App.execute('components:get', ['xemware.nimblescript.component.scriptparametersbuilder'], function (err, Components)
            {
                Components[0].showModal();
            });
        });

        App.commands.setHandler('test:component:scriptrunner:create', function ()
        {
            App.execute('components:get', ['xemware.nimblescript.component.scriptrunner'], function (err, Components)
            {
                Components[0].showModal();
            });
        });

        App.commands.setHandler('test:component:publishscript:modal', function ()
        {
            App.execute('components:get', ['xemware.nimblescript.component.publishscript'], function (err, Components)
            {
                Components[0].showModal({ scriptPath: 'local*C:/Users/tshnaider/AppData/Roaming/xemware/nimbleScript/repository/Balsamiq thumbnail PDF exporter.ns' });
            });
        });

        App.commands.setHandler('test:component:openscriptdocument:fail', function ()
        {
            App.request('scripts:getmanager').openScript('local*C:/Users/tshnaider/AppData/Roaming/xemware/nimbleScript/repository/nS Test Script3.ns');
        });

        
        App.commands.setHandler('test:document:add', function ()
        {
            require(['document'], function (Document)
            {
                var MyDoc = Document.extend({
                    title: 'My Document',
                    renderContent: function (callback)
                    {
                        callback($('<div>Hello</div>'));
                    }
                });
                var myDoc = new MyDoc();
                var documentManager = App.request('documents:getmanager');
                documentManager.addDocument(myDoc);
            });
        })

    }
}
);