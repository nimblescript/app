({
  appDir: 'www',
  dir: 'www-built',
  baseUrl: '.',
  fileExclusionRegExp: /(^example)|(.git)$/,
  //separateCSS: true,
  map: {
    '*': {
      css: 'require-css/css'
    }
  },
  modules: [
  {
    name: 'app',
    exclude: ['core-components'],
  },
  {
    name: 'core-components',
    separateCSS: true,
    create: true,
    include: ['subsystem/component'], 
  }
  ]
  //name: 'app.js',
  //out: 'app-built.js'
})
