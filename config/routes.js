module.exports = function routes() {
  // General standalone pages
    this.root('general#home');
    this.get('dummy', 'general#dummy');
    this.get('404', 'general#error');

    // Rest of route are AJAX calls

    this.post('shutdown', 'general#shutdown');

    // User
    this.post('user/firsttime', 'user#firsttime');
    this.post('user/signin', 'user#signin');
    this.post('user/signout', 'user#signout');
    this.post('user/settings', 'user#savesettings');
    this.get('user/settings', 'user#getsettings');
    this.get('user/current', 'user#current');
    this.get('user/isfirsttime', 'user#isfirsttime');
    // Logging
    this.post('log', 'logging#create');
    this.get('log', 'logging#search');

    // Repository
    this.get('repository/search', 'repository#search');
    this.get('repository/item/:itempath/children', 'repository#itemChildren');
    this.get('repository/item/:itempath/summary', 'repository#itemSummary');
    this.get('repository/item/:itempath/parameters', 'repository#itemParameters');
    this.post('repository/item/:itempath/run', 'repository#itemRun');
    this.get('repository/item/:itempath/alldata', 'repository#itemAllData');
    this.get('repository/item/:itempath', 'repository#itemGet');
    this.post('repository/item/:itempath/clone', 'repository#itemClone');
    this.get('repository/template/:itempath', 'repository#templateGet');
    this.get('repository/templates', 'repository#templateFind');
    this.get('repository/repositories', 'repository#repositories');
    this.post('repository/item/:itempath/newfolder', 'repository#newFolder');
    this.delete('repository/item/:itempath', 'repository#itemDelete');
    this.post('repository/item/:itempath/rename', 'repository#itemRename');
    this.put('repository/item/:itempath', 'repository#itemSave');

    // Script execution
    this.get('runner/status/:instanceid', 'runner#status');
    this.get('runner/stop/:instanceid', 'runner#stop');
    this.post('runner/run', 'runner#run');
    this.get('runner/history', 'runner#history');

    // Parameters
    this.get('savedparam', 'savedparam#search');
    this.put('savedparam/:id', 'savedparam#save');
    this.get('savedparam/:id', 'savedparam#get');
    this.delete('savedparam/:id', 'savedparam#del');

    // Favorites
    this.get('favorites', 'favorites#search');
    this.post('favorites/:id', 'favorites#save');
    this.post('favorites/:id/rename', 'favorites#rename');
    this.get('favorites/:id', 'favorites#get');
    this.delete('favorites/:id', 'favorites#del');

    // File lists
    this.get('filelists', 'filelist#search');
    this.get('filelists/:id', 'filelist#load');
    this.post('filelists/:id', 'filelist#save');
    this.delete('filelists/:id', 'filelist#del');

    // Modules
    this.get('modules', 'module#installed');
    this.get('module/:id', 'module#get');
    this.delete('module/:id', 'module#del');

    // Helper
    this.post('helper/launchfile', 'helper#launchfile');
    this.post('helper/opendirectory', 'helper#opendirectory');

    // Marketplace
    this.get('marketplace', 'marketplace#search');
    this.get('marketplace/auth', 'marketplace#auth')
    this.get('marketplace/authstatus', 'marketplace#authStatus')
    this.get('marketplace/item/:id/info', 'marketplace#itemInfo');
    this.post('marketplace/item/:id/install', 'marketplace#itemInstall');
    this.get('marketplace/publishers', 'marketplace#publishers');
    this.get('marketplace/publisher/:id/items', 'marketplace#publisherItems');
    this.get('marketplace/categories', 'marketplace#categories');
    this.get('marketplace/licenses', 'marketplace#licenses');
    this.post('marketplace/publish/item', 'marketplace#itemPublish');

    // File system
    this.get('filesystem/rootfolders', 'filesystem#rootfolders');
    this.get('filesystem/:id/foldercontents', 'filesystem#foldercontents');
    this.post('filesystem/:id/launch', 'filesystem#launch');
    this.post('filesystem/:id/rename', 'filesystem#rename');
    this.post('filesystem/:id/newfolder', 'filesystem#newfolder');
    this.delete('filesystem/:id', 'filesystem#del');

    // Components
    this.get('components/installed', 'component#installed');

    // Widgets
    this.get('widgets/installed', 'widget#installed');

    // Plugins
    this.get('plugins/installed', 'plugin#installed');
}
 