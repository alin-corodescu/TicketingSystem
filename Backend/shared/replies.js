var AWS = require('aws-sdk');

var docClient = new AWS.DynamoDB.DocumentClient();

function getRepliesForTicket(ticketId) {
    // Query dynamoDB to return the groups of this user
    var params = {
        TableName : "Replies",
        KeyConditionExpression: "ticketId = :ticket",
        ScanIndexForward: false,
        ExpressionAttributeValues: {
            ":ticket":ticketId
        }
    };
    
    var op = docClient.query(params).promise()
    .then((data) => {
        return data.Items;
    })
    .catch((err) => {
        console.log("Got a fucking error" + err);
    });
    
    return op;
    
}

function addReplyToTicket(ticketId, reply, sender) {
    var wrappedReply = wrapReply(reply, sender)
    wrappedReply.ticketId = ticketId
    
    var params = {
        TableName : "Replies",
        Item: wrappedReply
    }
    return docClient.put(params).promise()
    // Add the wrapped Reply to dynamo now
    
} 

function wrapReply(message, sender) {
    var reply;
    reply.message = message;
    reply.sender = sender;
    reply.date = new Date().toISOString()
    return reply;
}

exports.getRepliesForTicket = getRepliesForTicket
exports.addReplyToTicket = addReplyToTicket