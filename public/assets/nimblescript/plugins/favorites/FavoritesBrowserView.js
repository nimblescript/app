define(['require', 'backbone', 'marionette', 'jquery', 'App', 'swig', 'logger', 'text!./favoritesbrowser.html', 'select2/select2', 'moment',
    'css!./favoritesbrowser','modalhelper'],
    function (require, Backbone, Marionette, $, App, Swig, Logger, html, $select2, moment,css, ModalHelper)
    {
        "use strict"

        return Marionette.ItemView.extend(
            {
                template: Swig.compile(html),
                tagName: 'div',
                className: 'favorites-browser',
                ui: {
                    favorites: 'select'
                },
                events:
                    {
                        'click a[data-action=open]': 'open',
                        'click a[data-action=delete]': 'del',
                        'click a[data-action=rename]': 'rename'
                    },
                onRender: function ()
                {
                    this.ui.favorites.select2();
                    this.populateFavorites();
                },
                initialize: function ()
                {
                    this._scriptManager = App.request('scripts:getmanager');
                    this._favoritesManager = App.request('favorites:getmanager');
                    this.listenTo(this._favoritesManager, 'all', this.onFavoritesEVent);
                },
                populateFavorites: function ()
                {
                    var self = this;
                    this._favoritesManager.search(null, function (err, favorites)
                    {
                        if (!err)
                        {
                            var current = self.ui.favorites.val();
                            self.ui.favorites.empty();
                            _.each(favorites, function (favorite)
                            {
                                self.ui.favorites.addSelectOption(favorite.name, favorite.name, _.isEqual(current, favorite.name), { data: favorite.content });
                            })
                            self.ui.favorites.select2();
                        }
                    });
                },
                del: function ()
                {
                    var self = this;
                    var favoriteName = this.ui.favorites.val();
                    if (!_.isEmpty(favoriteName))
                        self._favoritesManager.deleteFavorite(favoriteName, function (err)
                        {
                            err && new ModalHelper().error(err)
                        });
                },
                rename: function()
                {
                    var self = this;

                    var currentName = this.ui.favorites.val();

                    if (_.isEmpty(currentName))
                        return;

                    var modal = new ModalHelper().prompt({
                        title: 'Rename favorite...',
                        text: 'Specify new name',
                        value: currentName,
                        onButton: function (text)
                        {
                            if (text == 'OK')
                            {
                                var name = modal.find('input.active').val();
                                var r = /[A-Za-z\-_\s0-9]+/;
                                if (!name.match(r))
                                {
                                    new ModalHelper().alert({ title: 'Error...', text: 'Only following characters are supported:<br/> A-Z, a-z, 0-9, _, -, and spaces' });
                                    return false;
                                }
                                doRename(name);
                            }
                            return true;
                        }
                    });

                    function doRename(newName)
                    {
                        if (!_.isEqual(currentName, newName))
                        {
                            self._favoritesManager.renameFavorite(currentName, newName, function (err, response)
                            {
                                if (err || !response.success)
                                    new ModalHelper().error(err || response.messages);

                            });
                        }
                    }
                },
                open: function ()
                {
                    var favorite = this.ui.favorites.children('option:selected').data('data');
                    if (favorite)
                    {
                        switch (favorite.type)
                        {
                            case 'runscript':
                                this._scriptManager.openScript(favorite.scriptpath, {
                                    settings: { run: false, paramValues: favorite.parameters, runSettings: favorite.runsettings },
                                    viewOptions: { showDetails: true, showParameters: true }
                                });
                        }
                    }

                },
                onFavoritesEVent: function (eVentType, name, arg2)
                {
                    var currentFavoriteName = this.ui.favorites.val();
                    switch (eVentType)
                    {
                        case 'favorite:saved':
                        case 'favorite:loaded':
                            this.ui.favorites.addSelectOption(name, name, null, { data: arg2 });
                            break;
                        case 'favorite:renamed':
                            this.ui.favorites.children('option[value="' + name + '"]').attr('value', arg2).text(arg2);
                            break;
                        case 'favorite:deleted':
                            this.ui.favorites.children('option[value="' + name + '"]').remove();
                            // Set <New> selected if deleted is current
                            break;
                    }
                    this.ui.favorites.select2('val', '');
                }
            });
    }
)
