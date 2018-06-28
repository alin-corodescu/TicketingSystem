'use strict';

const AWS = require("aws-sdk");
const uuid = require("uuid");

const utils = require("../shared/utils")

const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {
    
    var username = utils.getUsernameForRequest(event, callback);
    
    // the event parameter contains what I have as parameter to the function
    console.log(event)
    var newTicketData = JSON.parse(event.body)
    
    // set the necessary fields for the ticket
    newTicketData.ticketId = uuid();
    newTicketData.status = "Pending";
    newTicketData.openDate = new Date().toISOString();
    
    setFromData(newTicketData, username);
    
    storeTicket(newTicketData).then(() => {

        basicAccessForTicket(newTicketData, context, callback).then(() => {
            callback(null, {
            statusCode : 200,
            body: JSON.stringify(newTicketData),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
            isBase64Encoded: false
            });
        }).catch((err) => { console.log("inner catch called"); utils.defaultErrorHandler(err, context, callback)});
    }).catch((err) => { console.log("outer catch called"); utils.defaultErrorHandler(err, context, callback)});
    
    
};


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

function basicAccessForTicket(ticketData, context, callback) {
    var to = ticketData.receiver
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
    }).catch((err) => { utils.defaultErrorHandler(err, context, callback)});
}