{% macro injectresources resources %}
{% for resource in resources %}
{% if resource.resource_type == 'script' %}
<script type="{{ resource.type }}" {% if resource.src %}src="{{ resource.src }}"{% endif %}>{% if resource.content %}{{ resource.content }}{% endif %}</script>
{% else if resource.resource_type == 'stylesheet' %}
stylesheet!
{% else if resource.resource_type == 'meta' %}
meta!
{% endif %}
{% endfor %}
{% endmacro %}

{% macro loading %}
<div style="height: 400px; width: 100%; text-align: center">
	<div id="floater">
		<div id="content">
			<img src="/assets/img/loading2.gif">
		</div>
	</div>
</div>
{% endmacro %}
{% macro showactive ami tmi %}{% if ami == tmi %}active{% endif %}{% endmacro %}