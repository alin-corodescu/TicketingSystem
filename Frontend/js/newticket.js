 $('#file-upload').bind('change', function() { 
 	var fileName = $(this).val();
 	fileName = fileName.substring(fileName.lastIndexOf("\\") + 1, fileName.length);
 	var span = $('<div />\n').addClass('span-filename').html(fileName);
 	 $('#container-selected-files').append(span); 
 }) 

