var ticket_information, ticket_log;
var ticketID = getParameterByName("ticketID");
start(ticketID);

// var token;
//
// WildRydes.authToken
//     .then((data) => {
//         token = data
//     })
//     .catch((err) => {
//         console.log("Got an error while getting the token  " + err)
//     })

function start(ticketID) {
    start_getting_data(ticketID)
        .then((data) => {
            [ticket_information, ticket_log] = data;
            start_rendering();
        })

}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function dissmissLoader() {
    document.getElementById("loader").style.display = "none";
    document.getElementById("page-content").style.display = "block";
}

function render_ticket_information_step1() {
    var simple_item_list_template = [
        '<li>',
        '<div>',
        '<span>{{field_name}}:</span>',
        '<span>{{field_value}}</span>',
        '</div>',
        '</li>'
    ].join("\n");

    fields = ['ID', 'Sender', 'Created', 'Deadline']
    for (var i = 0; i < fields.length; i++) {
        key = fields[i];
        data =
            {
                field_name: key,
                field_value: ticket_information[key]
            }
        $("#ticket-information-list").append(Mustache.render(simple_item_list_template, data));
    }
}

function render_ticket_information_step2() {
    var ticket_description_template = [
        '<li>Description</li>',
        '<ul class="circle-square second-level-list">',
        '<li>{{Description}}</li>',
        '<li>Attachments</li>',
        '<ul class="circle-square second-level-list" id="attachments-list">',
        '</ul>',
        '</ul>'
    ].join("\n");

    data =
        {
            'Description': ticket_information['Description']
        }
    $("#ticket-information-list").append(Mustache.render(ticket_description_template, data));
}

function render_ticket_information_step3() {
    var ticket_attachments_template = ['<li><a href="#"><u>{{Attachment}}</u></a></li>'].join("\n");

    for (var i = 0; i < ticket_information['Attachments'].length; i++) {
        data =
            {
                'Attachment': ticket_information['Attachments'][i]
            }
        $("#attachments-list").append(Mustache.render(ticket_attachments_template, data));
    }
}

function render_ticket_history() {
    var chat_message_right_template = [
        '<span class="">{{Timestamp}}</span>',
        '<div class="container container-right flexbox">',
        '<div class="side2">',
        '<img src="images/icons/user.png" alt="Avatar">',
        '<span id="senderName">{{Sender}}</span>',
        '</div>',
        '<div class="main2">',
        '<p class="message message-left">{{Message}}</p>',
        '</div>',
        '</div>',
    ].join("\n");

    var chat_message_left_template = [
        '<span class="">{{Timestamp}}</span>',
        '<div class="container container-left flexbox">',
        '<div class="main2">',
        '<p class="message message-right">{{Message}}</p>',
        '</div>',
        '<div class="side2">',
        '<img src="images/icons/user.png" alt="Avatar">',
        '<span id="senderName">{{Sender}}</span>',
        '</div>',
        '</div>',
    ].join("\n");

    for (var i = 0; i < ticket_log.length; i++) {
        data =
            {
                'Sender': ticket_log[i]['Sender'],
                'Message': ticket_log[i]['Message'],
                'Timestamp': ticket_log[i]['Timestamp']

            }
        if (data['Sender'] === 'Mos Craciun')
            $("#ticket-log").prepend(Mustache.render(chat_message_right_template, data));
        else
            $("#ticket-log").prepend(Mustache.render(chat_message_left_template, data));
    }

}


function start_rendering() {
    render_ticket_information_step1()
    render_ticket_information_step2()
    render_ticket_information_step3()

    select_current_priority();
    add_receivers();

    render_ticket_history();

    dissmissLoader();
}

function select_current_priority() {
    priority = ticket_information['Priority']
    $('select[name=priority] option:eq(' + priority + ')').attr('selected', 'selected');
}

function add_receivers() {
    var receiver_template = ['<option value="1" disabled selected>{{Receiver}}</option>'].join("\n");
    for (var i = 0; i < ticket_information['Receivers'].length; i++) {
        data =
            {
                'Receiver': ticket_information['Receivers'][i]
            }
        $("#receivers-list").append(Mustache.render(receiver_template, data));
    }
}

// BACKEND
// --------------------------------------------------------------------------------------------------
function start_getting_data(ticketID) {
    var ticket_details_model = {
        'ID': 'ticketId',
        'Sender': 'from',
        'Created': 'openDate',
        'Deadline': 'deadline',
        'Priority': 'priority',
        'Description': 'TicketDiscription',
        // Todo add receiver field
    };
    var ticket_history_model = {
        'Message': 'message',
        'Sender': 'sender',
        'Timestamp': 'date'
    };
    // For the moment keep attachments there
    var ticket_details = {'Attachments': ['presentation.pptx']};
    var ticket_history = [];
    var method = "GET";
    var endpoint = _config.api.invokeUrl + "/tickets/" + ticketID;


    return $.ajax({
        method: method,
        crossDomain: true,
        url: endpoint,
        headers: {
            Authorization: token
        }
    }).then((ticket_data) => {
        // Now we need to map the ticket data to the model
        console.log("ticket data " + JSON.stringify(ticket_data));
        Object.keys(ticket_details_model).forEach((key, index) => {
            // the model will contain the mapping to the JSON values stored on the backend
            if (ticket_data.hasOwnProperty(ticket_details_model[key])) {
                ticket_details[key] = ticket_data[ticket_details_model[key]];
            }
            else {
                alert("Ticket contained malformed data: field " + key + " not found");
            }
        });

        endpoint = _config.api.invokeUrl + "/access/" + ticketID;
        // Now get the receivers field
        return $.ajax({
            method: method,
            crossDomain: true,
            url: endpoint,
            headers: {
                Authorization: token
            }
        });
    })
        .then((receivers) => {
            console.log("Ticket receivers " + JSON.stringify(receivers));
            ticket_details.Receivers = [];
            ticket_details.Receivers = ticket_details.Receivers.concat(receivers);

            endpoint = _config.api.invokeUrl + "/replies/" + ticketID;
            // Now get the receivers field
            return $.ajax({
                method: method,
                crossDomain: true,
                url: endpoint,
                headers: {
                    Authorization: token
                }
            });
        })
        .then((messages) => {
            for (var i in messages) {
                var message = messages[i];
                var convertedMessage = {};
                Object.keys(ticket_history_model).forEach((key, index) => {
                    // the model will contain the mapping to the JSON values stored on the backend
                    if (message.hasOwnProperty(ticket_history_model[key])) {
                        convertedMessage[key] = message[ticket_history_model[key]];
                    }
                    else {
                        alert("Reply contained malformed data: field " + key + " not found");
                    }
                });
                ticket_history.push(convertedMessage);
            }
            console.log("ticket_details = " + JSON.stringify(ticket_details));
            console.log("ticket_history = " + JSON.stringify(ticket_history));
            return [ticket_details, ticket_history];
        })
}

function sendMessage() {
    var message = document.getElementById('chatMessage').value;
    if (message != "")
        console.log(message);
    var endpoint = _config.api.invokeUrl + "/replies/" + ticketID;
    var wrappedMessage = {message: message};
    $.ajax({
        method: "POST",
        crossDomain: true,
        url: endpoint,
        headers: {
            Authorization: token
        },
        data: JSON.stringify(wrappedMessage),
        contentType: 'application/json'
    }).then((data) => {
        console.log("Reply succesfully registered " + data);
        //todo add a refresh of the replies section
    }).catch((err) => {
        console.log("Error occured while adding the reply " + err);
    })

}

function editContributor(usecase) {
    var contributor = "";
    var accessPolicy = {};

    var endpoint = _config.api.invokeUrl + "/access/" + ticketID;
    if (usecase === 0) {
        contributor = document.getElementById('addNewContributor').value;
        // check if not already in list of contributors
        // if he is not already in, send it to endpoint
        accessPolicy.type = "GRANT";
        accessPolicy.target = contributor;
    }
    if (usecase === 1) {
        contributor = document.getElementById('removeExistingContributor').value;
        // check if in list of contributors
        accessPolicy.type = "REVOKE";
        accessPolicy.target = contributor;
        // if he is, send it to endpoint
    }

    $.ajax({
        method: "PUT",
        crossDomain: true,
        url: endpoint,
        headers: {
            Authorization: token
        },
        data: JSON.stringify(accessPolicy),
        contentType: 'application/json'
    }).then((data) => {
        console.log("Access succesfully modified " + data);
        //todo add a refresh of the ticket details section
    }).catch((err) => {
        console.log("Error occured while modifying access " + err);
    })

}


function updateTicket() {
    var priority = $('#selectPriority').find(":selected").text();
    var status = $('#ticketStatus').find(":selected").text();
    var updateJson = {
        priority : priority,
        status : status
    };
    var endpoint = _config.api.invokeUrl + "/tickets/" + ticketID;
    $.ajax({
        method: "POST",
        crossDomain: true,
        url: endpoint,
        headers: {
            Authorization: token
        },
        data: JSON.stringify(updateJson),
        contentType: 'application/json'
    }).then((data) => {
        console.log("Ticket data succesfully modified " + data);
        //todo add a refresh of the ticket details section
    }).catch((err) => {
        console.log("Error occured while modifying ticket data " + err);
    })
}