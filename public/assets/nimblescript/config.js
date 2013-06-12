require.config({
    baseUrl: '/assets/nimblescript',
    paths: {
        underscore: 'lib/lodash',
        backbone: 'lib/backbone',
        marionette: 'lib/backbone.marionette',
        jquery: 'lib/jquery-1.9.1',
        'jquery.ui': 'lib/jquery-ui-1.10.2.custom',
        'jquery.splitter': 'lib/jquery.splitter',
        'jquery.cookie': 'lib/jquery.cookie',
        'jquery.mb.browser': 'lib/jquery.mb.browser',
        assets: '/assets',
        swig: 'lib/swig/swig',
        bootstrap: '../bootstrap230/js/bootstrap',
        async: 'lib/async',
        json2: 'lib/json2',
        "backbone-forms": 'lib/backbone-forms-amd/backbone-forms',
        "backbone-super": 'lib/backbone-super',
        "backbone-forms-bootstrap": 'lib/backbone-forms-amd/templates/bootstrap',
        "backbone-pageable": "lib/backbone-pageable",
        "backgrid": "lib/backbone-backgrid/backgrid",
        "backgrid-paginator": "lib/backbone-backgrid/extensions/paginator/backgrid-paginator",
        "backgrid-moment-cell": "lib/backbone-backgrid/extensions/moment-cell/backgrid-moment-cell",
        "backbone.wreqr": 'lib/backbone.wreqr',
        "backbone.babysitter": 'lib/backbone.babysitter',
        "moment": 'lib/moment',
        'bootstrap-modal': 'lib/bootstrap-modal/js/bootstrap-modal',
        'bootstrap-modalmanager': 'lib/bootstrap-modal/js/bootstrap-modalmanager',
        'bootstrap-colorpicker': 'lib/bootstrap-colorpicker/js/bootstrap-colorpicker',
        'bootstrap-datepicker': 'lib/bootstrap-datepicker/bootstrap-datepicker',
        'deep-model': 'lib/deep-model.min',
        // 'deep-extend': 'lib/underscore.mixin.deepExtend',
        'backbone-picky': 'lib/backbone.picky',
        'gauntlet': 'lib/marionette.gauntlet',
        'i18n': 'lib/i18next/i18next.amd.withJQuery-1.6.0',
        'mousetrap': 'lib/mousetrap-1.3.0',
        'logger': 'subsystem/debug/logger',
        'widget': 'subsystem/widgets/Widget',
        'document': 'subsystem/documents/Document',
        'dynatree': 'lib/dynatree/jquery.dynatree-1.2.4',
        'jquery.datatables': 'lib/jquery.dataTables',
        'jquery.datatables.rowReordering': 'lib/jquery.dataTables.rowReordering',
        'jquery.scrollintoview': 'lib/jquery.scrollintoview',
        'jquery.contextmenu': 'lib/jquery-contextMenu/jquery.contextMenu',
        'ace': 'lib/ace',
        'select2': 'lib/select2',
        'acorn': 'lib/acorn',
        'acorn-loose': 'lib/acorn_loose',
        'jshint': 'lib/jshint-1.1.0',
        'jquery.txtinput': 'lib/jquery.txtinput',
        'jquery.layout': 'lib/jquery.layout-latest',
        'jquery.blockui': 'lib/jquery.blockUI',
        'jquery.pnotify': 'lib/pnotify/jquery.pnotify',
        'notify': 'helpers/Notify',
        'keyboardshortcuts': 'helpers/KeyboardShortcuts',
        'rateit': 'lib/rateit/jquery.rateit.min',
        'translate': 'helpers/Translate',
        'cookie': 'helpers/Cookie',
        'cleditor': 'lib/cleditor/jquery.cleditor'
    },
    waitSeconds: 300,
    map: {
        '*': {
            'css': 'lib/require-css/css', // or whatever the path to require-css is
            'text': 'lib/text'
        }
    },
    packages: [
        {
            name: 'modalhelper',
            location: 'helpers/Modal',
            main: 'Modals'
        }
    ],
    shim: {
        "backbone-forms-bootstrap": {
            deps: ['lib/backbone-forms-amd/editors/list']
        },
        "rateit": {
            deps: ['jquery','css!lib/rateit/rateit']
        },
        "bootstrap-colorpicker": {
            deps: ['css!lib/bootstrap-colorpicker/css/bootstrap-colorpicker']
        },
        "bootstrap-datepicker": {
            deps: ['css!lib/bootstrap-datepicker/datepicker']
        },
        "cleditor": ['jquery','css!lib/cleditor/jquery.cleditor', 'jquery.mb.browser'],
        "acorn_loose": ['acorn'],
        "jquery.layout": ['jquery'],
        "jquery.blockui": ['jquery'],
        "jquery.pnotify": ['jquery'],
        "select2/select2": ['jquery','css!select2/select2','css!select2/select2-bootstrap'],
        "jquery.dataTables.rowReordering": ['jquery.dataTables','jquery.ui'],
        "jquery.contextmenu": ['jquery'],
        "jquery.txtinput": ['jquery'],
        "jquery.scrollintoview": ['jquery'],
        "jquery.datatables": ['jquery'],
        "dynatree": ['jquery'],
        "jquery.ui": ['jquery'],
        "jquery.splitter": ['jquery','jquery.cookie','jquery.mb.browser'],
        "jquery.cookie": {
            deps: ['jquery']
        },
        "i18n": ['jquery'],
        'backbone-picky': ['underscore', 'backbone'],
        "jshint": {
            exports: 'JSHINT'
        },
        "gauntlet": {
            deps: ['backbone-picky'],
            exports: 'Marionette.Gauntlet'
        },
        "bootstrap-modal": ['bootstrap-modalmanager'],
        "bootstrap-modalmanager": ['bootstrap'],
        "gritter": ['jquery'],
        "backgrid-moment-cell": {
            exports: 'Backgrid.Extension.MomentCell',
            deps: ['backgrid', 'moment']
        },
        "backgrid-paginator": {
            exports: 'Backgrid.Extension.Paginator',
            deps: ['backgrid']
        },
        "backgrid": {
            exports: "Backgrid",
            deps: ["underscore", "backbone", "backbone-pageable"],
            init: function (_, Backbone, PageableCollection)
            {
                Backbone.PageableCollection = PageableCollection;
            }
        },
        "backbone-pageable": ["backbone"],
        "backbone-paginator": ["backbone"],
        'lib/backbone-localStorage': ['backbone'],
        underscore: {
            exports: '_'
        },
        "uglifyjs": {
            exports: 'UglifyJS'
        },
        "backbone-super":
            {
                deps: ['backbone']
            },
        backbone: {
            exports: 'Backbone',
            deps: ['jquery', 'underscore', 'json2']
        },
        marionette: {
            exports: 'Backbone.Marionette',
            deps: ['backbone', 'backbone-super']
        },
        swig:
            {
                exports: 'swig',
                deps: ['underscore']
            },
        bootstrap:
            {
                exports: 'bootstrap',
                deps: ['jquery']
            }
    }
});

