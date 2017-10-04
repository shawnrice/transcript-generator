'use strict';

module.exports = function( context, config ) {
	var content = '';

	content += `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>${context.title}</title>
  <style>${context.css}</style>
</head>
<body>
	`.trim();


	return content;
};