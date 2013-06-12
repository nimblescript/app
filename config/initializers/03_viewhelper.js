var SnackleViewHelper = require('../../lib/viewhelper');

module.exports = function ()
{
    // Add menus
    SnackleViewHelper.Menus['default'] = [
        new SnackleViewHelper.MenuItem({
            title: 'About',
            id: 'about',
            url: '/about'
        }),
        new SnackleViewHelper.MenuItem({
            title: 'Pricing',
            id: 'pricing',
            url: '/pricing'
        }),
        new SnackleViewHelper.MenuItem({
            title: 'Support',
            id: 'support',
            url: '/support'
        }),
        new SnackleViewHelper.MenuItem({
            title: 'Contact',
            id: 'contact',
            url: '/contact'
        })
    ];

}

