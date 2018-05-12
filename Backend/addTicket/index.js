'use strict';

const AWS = require("aws-sdk");
const uuid = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {
    var username = "Coro"
    if (event.requestContext.hasOwnProperty("authorizer") && !event.requestContext.authorizer) {
        console.log("Authorizer has not been set");
        username = event.requestContext.authorizer.claims['cognito:username'];
    }
    
    // the event parameter contains what I have as parameter to the function
    console.log(event)
    var newTicketData = JSON.parse(event.body)
    
    // set the necessary fields for the ticket
    newTicketData.ticketId = uuid();
    newTicketData.openDate = new Date().toISOString();
    setFromData(newTicketData, username);
    
    storeTicket(newTicketData).then(() => {
        basicAccessForTicket(newTicketData, callback).then(() => {
            callback(null, {
            statusCode : 200,
            body: JSON.stringify(newTicketData),
            headers: {
                'Access-Control-Allow-Origin': '*',
                }
            });
        }).catch((err) => { console.log("inner catch called"); defaultErrorHandler(err, callback)});
    }).catch((err) => { console.log("outer catch called"); defaultErrorHandler(err, callback)});
    
    
};

function defaultErrorHandler(err, callback) {
    console.error(err)
    errorResponse(err.message, context.awsRequestId, callback)
}

function errorResponse(errorMessage, awsRequestId, callback) {
  callback(null, {
    statusCode: 500,
    body: JSON.stringify({
      Error: errorMessage,
      Reference: awsRequestId,
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function setFromData(ticketData, username) {
    if (ticketData.hasOwnProperty("from"))
        return
    ticketData.from = username;
}

function storeTicket(ticketData) {
    return dynamoDb.put({
        TableName : "Tickets",
        Item : ticketData
    }).promise();
}

function basicAccessForTicket(ticketData, callback) {
    var to = ticketData.to
    var from = ticketData.from
    var tid = ticketData.ticketId;
    
    return dynamoDb.put({
        TableName : "TicketsAccess",
        Item : {
            ticketId : tid,
            username : from
        }
    }).promise().then(() => {
        dynamoDb.put({
            TableName : "TicketsAccess",
            Item : {
                ticketId : tid,
                username : to
            }
        }).promise()
    }).catch((err) => { defaultErrorHandler(err, callback)});
}