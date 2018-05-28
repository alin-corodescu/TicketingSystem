var ticket_information, ticket_log;
var ticketID = getParameterByName("ticketID");
start(ticketID);

function start(ticketID){
	[ticket_information, ticket_log] = start_getting_data();
	start_rendering();
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

function dissmissLoader(){
	document.getElementById("loader").style.display = "none";
	document.getElementById("page-content").style.display = "block";
}

function render_ticket_information_step1(){
	var simple_item_list_template =  [
        '<li>',
		  	'<div>',
				'<span>{{field_name}}:</span>',
				'<span>{{field_value}}</span>',
			'</div>',
		'</li>'
    ].join("\n");

    fields =  ['ID', 'Sender', 'Created', 'Deadline']
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

function render_ticket_information_step2(){
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

function render_ticket_information_step3(){
	 var ticket_attachments_template = ['<li><a href="#"><u>{{Attachment}}</u></a></li>'].join("\n");

	for (var i = 0; i < ticket_information['Attachments'].length; i++) {
		data = 
		{
			'Attachment': ticket_information['Attachments'][i]
		}
		$("#attachments-list").append(Mustache.render(ticket_attachments_template, data));
	}
}

function render_ticket_history(){
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
		if(data['Sender'] === 'Mos Craciun')
			$("#ticket-log").prepend(Mustache.render(chat_message_right_template, data));
		else
			$("#ticket-log").prepend(Mustache.render(chat_message_left_template, data));
	}

}


function start_rendering(){
	render_ticket_information_step1()
	render_ticket_information_step2()
	render_ticket_information_step3()

	select_current_priority();
	add_receivers();

	render_ticket_history();

	dissmissLoader();
}

function select_current_priority(){
	priority = ticket_information['Priority']
	$('select[name=priority] option:eq('+ priority +')').attr('selected', 'selected');
}

function add_receivers(){
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
function start_getting_data(){
	ticket_details = {
		'ID':'1',
		'Sender' : 'Lenuta Alboaie',
		'Created': '2018-20-10',
		'Deadline': '2019-10-10',
		'Receivers' : ['Huma Cristian', 'Alin Corodescu'],
		'Priority' : '1',
		'Description': 'O descriere acolo frumos cat de cat',
		'Attachments' : ['presentation.pptx'],
		'Created At': '2018-10-12',
		'Deadline': '2019-01-01'
	}

	ticket_history = [
		{
			'Message': 'Hello!',
			'Sender': 'Mos Craciun',
			'Timestamp' : '2018-10-10'
		},
		{
			'Message': 'Hello to you too!',
			'Sender': 'Mos Nicolae',
			'Timestamp' : '2018-10-10'
		},
	]

	return [ticket_details, ticket_history]
}

function sendMessage(){
	var message = document.getElementById('chatMessage').value;
	if(message != "")
		console.log(message);
	//sending message to endpoint
}

function editContributor(usecase){
	var contributor = "";
	if(usecase === 0)
	{
		contributor = document.getElementById('addNewContributor').value;
		// check if not already in list of contributors
		// if he is not already in, send it to endpoint
	}
	if(usecase === 1)
	{
		contributor = document.getElementById('removeExistingContributor').value;
		// check if in list of contributors

		// if he is, send it to endpoint
	}
}


function updateTicket(){
	var priority = $('#selectPriority').find(":selected").text();
	var status = $('#ticketStatus').find(":selected").text();
}