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
// Dictionary object translating from header title to field name in the json stored in the database
var headerToJsonMapping = {
	"Case Id" : "ticketId",
	"Description" : "message",
	"Priority" : "priority",
	"Emiter" : "from",
	"Start Date" : "openDate",
	"Deadline" : "deadline",
	"Status" : "status"
};

function JsonToRowData(ticket) {
	var row_data = [];
	var headers = get_tickets_headers();
	for (var i in headers) {
		if (ticket.hasOwnProperty(headerToJsonMapping[headers[i]])) {
			row_data.push(ticket[headerToJsonMapping[headers[i]]]);
		}
		else {
            row_data.push("N/A");
        }
	}
	return row_data;
}

function get_tickets_records(){
	// create a function which maps a json to a record

	// Tickets for me will get the ticket list from the API
	var ticketsForMe;
    var rows_data;

	for (var t in ticketsForMe) {
		rows_data.push(JsonToRowData(ticketsForMe[t]));
	}
	// returns a 2D array where each 1d array represents a record. Order must match headers
	return rows_data;
}