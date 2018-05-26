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
    
    
    access.checkUserHasAccess(username, ticketId)
    .then((data) => {
        return replies.getRepliesForTicket(ticketId)
    } ,(err) => {
        console.log(err);
        utils.normalResponse("Access denied", 403, callback)
    })
    .then((data) => {
        utils.normalResponse(JSON.stringify(data), 200, callback)
    })
};
