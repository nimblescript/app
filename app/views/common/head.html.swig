  <title>{{ title }}</title>
  {{ injectresources(resourceManager.resourcesTopBefore) }}
  <meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
	<meta name="apple-mobile-web-app-capable" content="yes">
  <link rel="shortcut icon" href="/assets/ico/favicon.ico">
  <script src="{{ assetFingerprint('/assets/nimbleScript/lib/modernizr-2.5.3.min.js') }}"></script>
  
  <link href="{{ assetFingerprint('/assets/bootstrap230/css/bootstrap-responsive.css') }}" rel="stylesheet">
  <link id="bootstrap-theme" href="{{ assetFingerprint('/assets/css/bootstrap-themes/bootstrap-standard.css') }}" rel="stylesheet">
  <link href="{{ assetFingerprint('/assets/css/nimbleScript.css') }}" rel="stylesheet">
  <link id="bootstrap-theme-custom" href="{{ assetFingerprint('/assets/css/bootstrap-themes/custom-standard.css') }}" rel="stylesheet">
  <link href="{{ assetFingerprint('/assets/nimbleScript/lib/rateit/rateit.css') }}" rel="stylesheet">
  <link href="{{ assetFingerprint('/assets/nimbleScript/lib/dynatree/skins/skin-vista/ui.dynatree.css') }}" rel="stylesheet">
  <link rel="stylesheet" href="{{ assetFingerprint('/assets/nimblescript/lib/bootstrap-modal/css/bootstrap-modal.css') }}">
  <link href="{{ assetFingerprint('/assets/nimblescript/lib/jquery-contextmenu/jquery.contextMenu.css') }}" rel="stylesheet">
  <link rel="stylesheet" href="{{ assetFingerprint('/assets/fontawesome/css/font-awesome.min.css') }} ">
      <style type="text/css">
      body
      {
      }
      .sidebar-nav
      {
          padding: 9px 0;
      }
  </style>
    
	<!--<link rel="stylesheet" href="{{ assetFingerprint('/assets/css/ui-lightness/jquery-ui-1.8.21.custom.css') }}">	-->
  <!--<link href='http://fonts.googleapis.com/css?family=Anton' rel='stylesheet' type='text/css'>-->
  <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
  <!--[if lt IE 9]>
    <script src="{{ assetFingerprint('assets/js/respond.min.js') }}"></script>
  <![endif]-->

    {{ injectresources(resourceManager.resourcesTopAfter) }}
  