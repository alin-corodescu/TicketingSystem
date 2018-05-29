var data = {}
var header_template, row_template, headers, rows_data;
var ticket_details_page = "ticket.html";

[header_template, row_template] = generate_templates()

// var token;
//
// WildRydes.authToken
//     .then((data) => {
//         token = data
//     })
//     .catch((err) => {
//         console.log("Got an error while getting the token  " + err)
//     });

headers = get_tickets_headers();
assemle_table_headers(headers, header_template);

get_tickets_records()
    .then((rows_data) => {
        assemble_table_data(rows_data, row_template);
    });

window.setTimeout(dissmissLoader, 3000);

function dissmissLoader() {
    document.getElementById("loader").style.display = "none";
    document.getElementById("page-content").style.display = "block";
}

function generate_templates() {
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

    return [header_template, row_template]
}


function assemble_table_data(rows_data, row_template) {
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
        html = '<div class="row" onclick="redirectToTicketDetails('  + '&quot;'+ String(rows_data[i][0])  + '&quot;' + ')">' + html + '</div>'
        $("#tickets-table").append(html);
    }
}

function redirectToTicketDetails(ticketID) {
    window.TicketID = ticketID;
    window.location.href = "ticket.html?ticketID=" + ticketID;
}

function assemle_table_headers(headers, header_template) {
    for (var i = 0; i < headers.length; i++) {
        data = {header: headers[i]}
        $("#tickets-header").append(Mustache.render(header_template, data));
    }
}


// BACKEND
// ------------------------------------------------------------------------------------------------------
function get_tickets_headers() {
    // returns a list of the tickets table headers = column names
    var headers = ['Case ID', 'Description', 'Priority', 'Emiter', 'Start Date', 'Deadline', 'Status']
    return headers;
}

// Dictionary object translating from header title to field name in the json stored in the database
// Todo check that the values match the ones sent in the new-ticket values JSON
// Ticket DISCRIPTION for the win
//
var headerToJsonMapping = {
    "Case ID": "ticketId",
    "Description": "TicketDiscription",
    "Priority": "priority",
    "Emiter": "from",
    "Start Date": "openDate",
    "Deadline": "deadline",
    "Status": "status"
};

function JsonToRowData(ticket) {
    var row_data = [];
    var headers = get_tickets_headers();
    console.log(JSON.stringify(ticket));
    console.log(headers);
    for (var i in headers) {
        if (ticket.hasOwnProperty(headerToJsonMapping[headers[i]])) {
            row_data.push(ticket[headerToJsonMapping[headers[i]]]);
        }
        else {
            console.log("current ticket doesn't have field : " + headerToJsonMapping[headers[i]]);
            row_data.push("N/A");
        }
    }
    return row_data;
}

function get_tickets_records() {
    // create a function which maps a json to a record

    // Tickets for me will get the ticket list from the API
    var endpoint = _config.api.invokeUrl + "/tickets";
    var ticketsForMe;
    var method = "GET";

    //    Now make the call to the api
    return $.ajax({
        method: method,
        crossDomain: true,
        url: endpoint,
        headers: {
            Authorization: token
        }
    }).catch((err) => {
        console.log("got an error when getting the tickets " + JSON.stringify(err))
    })
        .then((tickets) => {
            console.log("Received tickets: " + JSON.stringify(tickets));
            var rows_data = [];
            for (var t in tickets) {
                rows_data.push(JsonToRowData(tickets[t]));
            }
            // returns a 2D array where each 1d array represents a record. Order must match headers
            return rows_data;
        })

}