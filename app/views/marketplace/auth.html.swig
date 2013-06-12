<html>
<head>
<title>nimbleScript marketplace authorization</title>
</head>
<body>
<script>
if (window.opener)
{
	window.opener.marketplaceAuthDone('{{ accesstoken }}');
	window.close();
}
</script>
Please close this window and re-start nimbleScript - Internet Explorer restrictions prevent this being automated.
</body>
</html>
