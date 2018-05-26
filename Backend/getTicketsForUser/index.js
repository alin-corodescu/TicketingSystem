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
            utils.normalResponse(JSON.stringify(actualTickets), 200, callback);
        })
        .catch((err) => {
           console.log("error: " + err); 
        });
        // // Get the groups this user is part of
        // let identifier_list = access.getGroupsForUser(username)
        
        // // Construct an identifier list
        // identifier_list.push(username)
        
        // // Get all the ticket id's 
        // let ticket_id_list = access.getTicketsAccessibleBy(identifier_list)
        
        // let ticket_list = tickets.getTicketsByIds(ticket_id_list);
        
        // // Return the tickets 
        // callback(null, {
        //     statusCode : 200,
        //     body: JSON.stringify(ticket_list),
        //     headers: {
        //         'Access-Control-Allow-Origin': '*',
        //         },
        //     isBase64Encoded: false
        //     });
    }
    catch (e) {
        utils.defaultErrorHandler(e, context, callback)
    }
    
    
};
