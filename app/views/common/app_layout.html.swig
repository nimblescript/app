<!doctype html>
<html>
  <head>
    {% include 'common/head.html.swig' %}
  </head>
  <body>
    <div id="wrap">
      <div class="navbar">
        <div class="navbar-inner">
          <div class="container-fluid">

            <a class="brand" href="#" data-i18n="misc.nimblescript"></a>
            <div class="pull-right">
              <a class="brand" href="#">
                <span class="version"></span>
              </a>
              
              <a target="_blank" href="https://marketplace.nimblescript.com/lovenimblescript" class="btn btn-mini btn-warning">
                <i class="icon-heart icon-white"></i>
                <span data-i18n="misc.support"></span>
              </a>
            </div>
            <div class="nav" id="menubar">
              <ul class="nav">
              </ul>
            </div>
            <!--/.nav-collapse -->
          </div>
        </div>
      </div>
      <div id="main">
      </div>
    </div>
    {{ injectresources(resourceManager.resourcesBottomBefore) }}
    <script src="{{ assetFingerprint('/assets/nimblescript/lib/require.js') }}"></script>
    {{ injectresources(resourceManager.resourcesBottomAfter) }}
    {% block extrascripts %}{% endblock %}
    <!--
<script>
$(function () {
	{% block domready %}{% endblock %}
});
</script>
-->
    {% include 'common/shared_templates.html.swig' %}
  </body>
</html>