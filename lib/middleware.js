var config = require('nimblescript-config')

/*
 * Authentication
 */
// If not authenticated redirect to login
module.exports.reqAuth = function (next)
{
    
  if (!this.req.isAuthenticated() && !config.get('debug:disableReqAuth') ) {
    // this.req.flash('error', 'Please login to perform this action');
    if (this.route.action !== 'logout')
      this.req.session.onLoginRedirect = this.urlFor();
    return this.redirect(this.urlFor({ controller: 'account', action: 'signup'}));
  }
  delete this.req.session.onLoginRedirect;
  next();
}

module.exports.reqAuthAjax = function (next)
{
    if (!this.req.isAuthenticated() && !config.get('debug:disableReqAuth'))
    {
        return this.res.status(401).end();
    }
    next();
}

// If authenticated redirect to account#show
module.exports.notAuth = function (next) {
  if (this.req.isAuthenticated()) {
    // this.req.flash('error', "You can't perform this action while logged in");
    return this.redirect(this.urlFor({ controller: 'account', action: 'show' }));
  }
  next();
}
