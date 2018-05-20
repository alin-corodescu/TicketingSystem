var data = {}

var headers = ['Case ID', 'Description','Priority', 'Emiter','Start Date','Deadline','Status']
var header_template = [
        '<div class="cell">',
            '{{header}}',
        '</div>'
    ].join("\n");
for (var i = 0; i < headers.length; i++) {
	data = {header: headers[i]}
    $("#tickets-header").append(Mustache.render(header_template, data));
}


var rows_data = 
[
	['1', 'Cloud Project','1', 'Lenuta Alboaie','15.04.2018', '30.05.2018', 'Pending']
]
var row_template= 
	[
    	'<div class="cell" data-title="{{header}}">',
        	'{{data}}',
        '</div>\n'
	].join("\n");

for (var i = 0; i < rows_data.length; i++) {
	var html = ''
	for (var j = 0; j < headers.length; j++) {
		data = 
		{
			header: headers[j],
			data: rows_data[i][j]
		}
	    html = html + Mustache.render(row_template, data);
	}
	html = '<div class="row">' + html + '</div>'
	$("#tickets-table").append(html);
}