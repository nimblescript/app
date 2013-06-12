{% extends 'common/app_layout.html.swig' %}
{% block content %}
<div id="wrapper"> 
  <div id="content"> 
    <div class="container"> 
		<div class="row">
			<div class="span12">
				<div class="error-container">
					<h1>Oops!</h1>
					<h2>404 Not Found</h2>
					<div class="error-details">
						Sorry, an error has occured, Requested page not found!
					</div> <!-- /error-details -->
					<div class="error-actions">
						<a href="./" class="btn btn-large btn-primary">
							<i class="icon-chevron-left"></i>
							&nbsp;
							Back to Dashboard						
						</a>
						<a href="./" class="btn btn-large">
							<i class="icon-envelope"></i>
							&nbsp;
							Contact Support						
						</a>
					</div> <!-- /error-actions -->
				</div> <!-- /.error-container -->				
			</div> <!-- /.span12 -->
		</div> <!-- /.row -->		
	</div>
  </div>
</div>
{% endblock %}