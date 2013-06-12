{% extends 'common/app_layout.html.swig' %} 
{% block extrascripts %}
<script>

// Simulate loaded data
var appData = {{ appData|json_encode|raw }};

require.config({
  baseUrl: '/assets/nimblescript',
  urlArgs: "v=" +  appData.version
  });

require(['config'], function (config) {
    require(['Main'], function(main)
	{
		// Main returns Marionette.Application instance
		main.start(appData);
	});
});
</script>
{% endblock %}
