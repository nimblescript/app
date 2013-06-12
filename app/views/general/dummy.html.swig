<!doctype html>
<html>
<head>
  <title>{{ title }}</title>
  <meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
	<meta name="apple-mobile-web-app-capable" content="yes">
  <link rel="shortcut icon" href="/assets/ico/favicon.ico">
  <script src="{{ assetFingerprint('/assets/js/libs/modernizr-2.5.3.min.js') }}"></script>
    <script src="{{ assetFingerprint('/assets/nimblescript/lib/jquery-1.9.1.js') }}"></script>
    <script src="{{ assetFingerprint('/assets/nimblescript/lib/jquery-ui-1.8.21.custom.min.js') }}"></script>
    <script src="{{ assetFingerprint('/assets/nimblescript/lib/jquery.mb.browser.js') }}"></script>
    <script src="{{ assetFingerprint('/assets/nimblescript/lib/jquery.cookie.js') }}"></script>
    <script src="{{ assetFingerprint('/assets/nimblescript/lib/jquery.splitter.js') }}"></script>
  <link rel="stylesheet" href="{{ assetFingerprint('/assets/css/font-awesome.css') }} ">
	<link rel="stylesheet" href="{{ assetFingerprint('/assets/bootstrap230/css/bootstrap.css') }}">
  <link id="bootstrap-theme" href="{{ assetFingerprint('/assets/css/bootstrap-themes/bootstrap-united.css') }}" rel="stylesheet">
  <link id="bootstrap-theme-custom" href="{{ assetFingerprint('/assets/css/bootstrap-themes/custom-standard.css') }}" rel="stylesheet">
  <link href="{{ assetFingerprint('/assets/bootstrap-datepicker/bootstrap-datepicker.css') }}" rel="stylesheet">
  <link href="{{ assetFingerprint('/assets/bootstrap-colorpicker/bootstrap-colorpicker.css') }}" rel="stylesheet">
  <link href="{{ assetFingerprint('/assets/rateit/rateit.css') }}" rel="stylesheet">
  <link href="{{ assetFingerprint('/assets/dynatree/skins/skin-vista/ui.dynatree.css') }}" rel="stylesheet">
  <link rel="stylesheet" href="{{ assetFingerprint('/assets/nimblescript/lib/backbone-backgrid/backgrid.css') }}">
  <link rel="stylesheet" href="{{ assetFingerprint('/assets/nimblescript/lib/custom-backgrid-paginator/backgrid-paginator.css') }}">
  <link rel="stylesheet" href="{{ assetFingerprint('/assets/nimblescript/lib/bootstrap-modal/css/bootstrap-modal.css') }}">
  <link href="{{ assetFingerprint('/assets/bootstrap230/css/bootstrap-responsive.css') }}" rel="stylesheet">
  <link href="{{ assetFingerprint('/assets/css/nimbleScript.css') }}" rel="stylesheet">
   <style type="text/css">
      body
      {
      }
      .sidebar-nav
      {
          padding: 9px 0;
      }
  </style>
    
  <link href='http://fonts.googleapis.com/css?family=Anton' rel='stylesheet' type='text/css'>
  <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
  <!--[if lt IE 9]>
    <script src="{{ assetFingerprint('assets/js/respond.min.js') }}"></script>
  <![endif]-->
    <style type="text/css" media="all">

      html, body { height: 100%; margin: 0; box-sizing:border-box; }

      .splitter {
      height-x: 400px;
      height-x: 50%;
      height: calc(100% - 180px);
      height: -moz-calc(100% - 180px);
      height: -webkit-calc(100% - 180px);
      margin: 1em 3em;
      border: 4px solid #bdb;
      background: #f8fff8;
      boo: 45px;
      }

      .ui-state-default { background-color: #aca }
      .ui-state-hover { background-color: #bdb }
      .ui-state-highlight { background-color: #add }
      .ui-state-error { background-color: #eaa }

      .splitter-pane {
      overflow: auto;
      }
      .splitter-bar-vertical {
      width: 9px;
      height-x: 100%;
      background-image: url(/assets/nimbleScript/subsystem/MainView/img/v-grabber.png);
      background-repeat: no-repeat;
      background-position: center;
      }

      .splitter-bar-vertical-docked {
      width: 10px;
      background-image: url(/assets/nimbleScript/subsystem/MainView/img/vdockbar-trans.gif);
      background-repeat: no-repeat;
      background-position: center;
      }
      .splitter-bar.ui-state-highlight {
      opacity: 0.7;
      }
      .splitter-iframe-hide {
      visibility: hidden;
      }
    </style>
    <script type="text/javascript">

    $().ready(function() {
        makeSplitter();
    });

    function makeSplitter()
    {
        $("#MySplitter").splitter({
            type: "v",
            outline: false,
            sizeLeft: 150,
            minLeft: 100,
            minRight: 100,
            resizeToWidth: true,
            dock: "right",
            dockSpeed: 200,
            cookie: "docksplitter",
            dockKey: 'Z',   // Alt-Shift-Z in FF/IE
            accessKey: 'I'  // Alt-Shift-I in FF/IE
        });
    }
    </script>

  </head>
<body>
    <div class="navbar navbar-fixed-top">
        <div class="navbar-inner">
            <div class="container-fluid">
                
                <a class="brand" href="#" data-i18n="misc.nimblescript"></a>
                <div class="pull-right">
                    <a class="brand" href="#"><span class="version"></span></a>
                    <span style="vertical-align: middle"><i class="icon-heart icon-white"></i> <span data-i18n="misc.love_nimblescript"></span> </span><a target="_blank" href="https://marketplace.nimblescript.com/lovenimblescript" class="btn btn-mini btn-warning" data-i18n="misc.support"></a>
                </div>
                <div class="nav" id="menubar">
                  <ul class="nav">
                  </ul>
                </div>
                <!--/.nav-collapse -->
            </div>
        </div>
    </div>
        <h1>jQuery Docking Splitter</h1>
        <p>
          This example demonstrates the use of a <em>docking</em> splitbar that animates a full move to the left or right.
          Undocking the splitter returns the splitbar to the position it had before docking.
          The user can also drag the splitbar in or out of the docked position.
          If the splitter specifies a minimum or maximum value for the left or right pane, those values will be enforced
          whenever the splitbar is undocked.
        </p>
        <p>
          <a href="index.html">See the splitter documentation</a>
        </p>
        <div id="MySplitter">

          <div id="LeftPane">
            <p>This is the left side of the vertical splitter. Typically you might use this side for a navigational display of some data that is related to the right side.</p>
            <p>Using CSS styles you can control the look of the splitter, such as its color, width, and appearance when selected. Or, you can specify most options when you call the plugin to create the splitter.</p>

            <p>
              <a href="javascript:void($('#MySplitter').trigger('toggleDock'))">trigger toggleDock</a>
            </p>
            <p>
              <a href="javascript:void($('#MySplitter').trigger('dock'))">trigger dock</a>
            </p>
            <p>
              <a href="javascript:void($('#MySplitter').trigger('undock'))">trigger undock</a>
            </p>
            <p>
              <a href="javascript:void($('#MySplitter').trigger('destroy'))">trigger destroy</a>
            </p>

          </div>

          <div id="RightPane">
            <p>This is the right side of the vertical splitter. Usually this side will be wider than the left side, but that's up to you. The left pane of this demo was set to be 150 pixels wide in the stylesheet, which is why the right pane is initially larger. If you don't specify a width for either panes when the splitter is created, the two panes will be equal width.</p>

            <p>This is the right side of the vertical splitter. Usually this side will be wider than the left side, but that's up to you. The left pane of this demo was set to be 150 pixels wide in the stylesheet, which is why the right pane is initially larger. If you don't specify a width for either panes when the splitter is created, the two panes will be equal width.</p>

            <p>This is the right side of the vertical splitter. Usually this side will be wider than the left side, but that's up to you. The left pane of this demo was set to be 150 pixels wide in the stylesheet, which is why the right pane is initially larger. If you don't specify a width for either panes when the splitter is created, the two panes will be equal width.</p>

            <p>
              The splitter plugin supports the use of the keyboard to move the splitbar via the browser's accessKey feature. To move the splitbar in IE or Firefox, press <kbd>Alt-Shift-L</kbd>, then press the arrow keys. To unfocus the splitbar, press <kbd>Tab</kbd>. In Opera, press <kbd>Shift-Esc</kbd> and then the letter <kbd>L</kbd>; remove focus with <kbd>Esc</kbd>.
            </p>

            <p>
              <a href="javascript:void($('#MySplitter').trigger('toggleDock'))">trigger toggleDock</a>
            </p>
            <p>
              <a href="javascript:void($('#MySplitter').trigger('dock'))">trigger dock</a>
            </p>
            <p>
              <a href="javascript:void($('#MySplitter').trigger('undock'))">trigger undock</a>
            </p>
            <p>
              <a href="javascript:void($('#MySplitter').trigger('destroy'))">trigger destroy</a>
            </p>


          </div>

        </div>

    <footer role="contentinfo">
		  <div class="container">
			<p>nimbleScript <span class="version"></span> - copyright (C) 2013 <a href="http://www.xemware.com">xemware limited</a>.</p>
		  </div>
	</footer>
</body>
</html>