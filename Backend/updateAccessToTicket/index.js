'use strict';

const AWS = require("aws-sdk");

const access = require("../shared/access")
const utils = require("../shared/utils")
const replies = require("../shared/replies")

const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {
    var username = utils.getUsernameForRequest(event, callback)
    
    var ticketId;
    
    if (event.pathParameters !== null && event.pathParameters !== undefined) {
        if (event.pathParameters.ticketId !== undefined && 
            event.pathParameters.ticketId !== null && 
            event.pathParameters.ticketId !== "") {
            console.log("Received ticketId: " + event.pathParameters.ticketId);
            ticketId  = event.pathParameters.ticketId;
        }
    }
    
    var accessPolicy = JSON.parse(event.body);
    
    if (access.checkUserHasAccess(username, ticketId)) {
        var result = access.updateAccessToTicket(ticketId, accessPolicy)
        
        utils.normalResponse(JSON.stringify(result), 200, callback)
    }
    else {
        utils.normalResponse("Access denied", 403, callback)
    }
};
