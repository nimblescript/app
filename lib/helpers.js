module.exports.dynamic = {
  user: function (req, res) {
    // Returns the current logged in user or false (if returning undefined templates throw reference error)
    return req.user || false;
  },
  route: function (req, res) {
    // Generate a basic route object for use in templates
    var route = {
      // Will be the classname of the controller, not the simplified name
      controller: req._locomotive.controller,
      action: req._locomotive.action,
      route: req.route,
    }
    // Is equal to the simplified name of the controller
    route.viewDir = req._locomotive.app._controllers[route.controller].__viewDir;
    return route
  }
}
