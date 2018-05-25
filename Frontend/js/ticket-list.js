var data = {}
var header_template, row_template, headers, rows_data;
var ticket_details_page = "ticket.html";

[header_template, row_template] = generate_templates()

headers = get_tickets_headers();
assemle_table_headers(headers, header_template);

rows_data = get_tickets_records();
assemble_table_data(rows_data, row_template);

window.setTimeout(dissmissLoader, 3000);

function dissmissLoader(){
	document.getElementById("loader").style.display = "none";
	document.getElementById("page-content").style.display = "block";
}

function generate_templates(){
	var header_template = [
        '<div class="cell">',
            '{{header}}',
        '</div>'
    ].join("\n");

	var row_template = 
	[
    	'<div class="cell" data-title="{{header}}">',
        	'{{data}}',
        '</div>\n'
	].join("\n");

	return  [header_template, row_template]
}


function assemble_table_data(rows_data, row_template){
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
		html = '<div class="row" onclick="redirectToTicketDetails(' + rows_data[i][0] +')">'  + html + '</div>'
		$("#tickets-table").append(html);
	}
}

function redirectToTicketDetails(ticketID){
	window.TicketID = ticketID;
	window.location.href="ticket.html?ticketID=" + ticketID;
}

function assemle_table_headers(headers,header_template){
	for (var i = 0; i < headers.length; i++) {
		data = {header: headers[i]}
	    $("#tickets-header").append(Mustache.render(header_template, data));
	}
}





// BACKEND
// ------------------------------------------------------------------------------------------------------
function get_tickets_headers(){
	// returns a list of the tickets table headers = column names
	var headers = ['Case ID', 'Description', 'Priority', 'Emiter', 'Start Date','Deadline', 'Status']
	return headers;
}

function get_tickets_records(){
	// returns a 2D array where each 1d array represents a record. Order must match headers
	var rows_data = 
	[
		['1', 'Cloud Project','1', 'Lenuta Alboaie','15.04.2018', '30.05.2018', 'Pending'],
		['2', 'Cloud Project','1', 'Lenuta Alboaie','15.04.2018', '30.05.2018', 'Pending'],
		['3', 'Cloud Project','1', 'Lenuta Alboaie','15.04.2018', '30.05.2018', 'Pending']
	]
	return rows_data;
}