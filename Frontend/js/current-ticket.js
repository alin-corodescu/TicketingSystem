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
//TODO we need to handle the e-mails somehow, the username can be != from the e-mail : for example the username = "demo", need to configure everything properly tho

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
        '</ul>'
    ].join("\n");

    data =
        {
            'Description': ticket_information['Description']
        }
    $("#ticket-information-list").append(Mustache.render(ticket_description_template, data));
}

function render_ticket_history() {
    var chat_message_right_template = [
        '<span class="">{{Timestamp}}</span>',
        '<div class="container container-right flexbox">',
        '<div class="side2">',
        '<img src="images/icons/user.png" alt="Avatar">',
        '<span class="elipsis-text" id="senderName">{{Sender}}</span>',
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
        '<span class="elipsis-text" id="senderName">{{Sender}}</span>',
        '</div>',
        '</div>',
    ].join("\n");
   
    if(ticket_log.length > 0){
        var template = chat_message_left_template;
        var last_sender = ticket_log[0]['Sender'];
        for (var i = 0; i < ticket_log.length; i++) {
            data =
                {
                    'Sender': ticket_log[i]['Sender'],
                    'Message': ticket_log[i]['Message'],
                    'Timestamp': ticket_log[i]['Timestamp']

                }
            if(last_sender != data['Sender'])
                if(template == chat_message_left_template)
                    template = chat_message_right_template;
                else
                    if(template == chat_message_right_template)
                    template = chat_message_left_template;
            $("#ticket-log").prepend(Mustache.render(template, data));
            last_sender = data['Sender'];
        }
    }

}


function start_rendering() {
    render_ticket_information_step1()
    render_ticket_information_step2()

    select_current_priority();
    select_current_status();
    add_receivers();

    render_ticket_history();

    dissmissLoader();
}

function select_current_priority() {
    $('#selectPriority option').filter(function(){
        return ($(this).text() == ticket_information['Priority']);
    }).prop('selected', true);
}

function select_current_status() {
    $('#ticketStatus option').filter(function(){
        return ($(this).text() == ticket_information['status']);
    }).prop('selected', true);
}

function showSuccesAlert(){
  $(".myAlert-succes").show();
  setTimeout(function(){
    $(".myAlert-succes").hide(); 
  }, 2000);
}

function showErrorAlert(){
  $(".myAlert-bottom").show();
  setTimeout(function(){
    $(".myAlert-eror").hide(); 
  }, 2000);
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

// todo create a way to handle access denied erros (easiest will be redirect to ticket list page + some message
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
        'status' : 'status',
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
        showSuccesAlert();
        setTimeout(function(){ location.reload();}, 2000);
    }).catch((err) => {
        console.log("Error occured while adding the reply " + err);
        showErrorAlert();
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
        modal.style.display = "none";
        showSuccesAlert();
        setTimeout(function(){ location.reload();}, 2000);
    }).catch((err) => {
        console.log("Error occured while modifying access " + err);
        modal.style.display = "none";
        showErrorAlert();
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
        showSuccesAlert();
        setTimeout(function(){ window.location.href = 'tickets.html';}, 2000);
    }).catch((err) => {
        console.log("Error occured while modifying ticket data " + err);
        showErrorAlert();
    })
}