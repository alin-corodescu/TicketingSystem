'use strict';

const AWS = require("aws-sdk");

const access = require("../shared/access")
const utils = require("../shared/utils")
const tickets = require("../shared/tickets")

const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {
    var username = utils.getUsernameForRequest(event, callback)
    
    try {
        var identifier_list;
        
        access.getGroupsForUser(username)
        .then((data) => {
            identifier_list = data
            identifier_list.push(username)
            var anotherPromise = access.getTicketsAccessibleBy(identifier_list)
            return anotherPromise
        })
        .then((dataFromTheAccessibleTickets) => {
            console.log("accessibleTicket ids " + dataFromTheAccessibleTickets.length);
            var ticket_id_list = dataFromTheAccessibleTickets;
            return tickets.getTicketsByIds(ticket_id_list);
        })
        .then((actualTickets) => {
            var unwrapped_tickets = actualTickets.map((item) => { return item.Item})
            utils.normalResponse(JSON.stringify(unwrapped_tickets), 200, callback);
        })
        .catch((err) => {
           console.log("error: " + err); 
        });
    }
    catch (e) {
        utils.defaultErrorHandler(e, context, callback)
    }
    
    
};
