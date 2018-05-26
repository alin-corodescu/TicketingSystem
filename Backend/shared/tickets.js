
var AWS = require('aws-sdk');

var docClient = new AWS.DynamoDB.DocumentClient();


function getTicketsByIds(ticket_id_list) {
    var promises = []
    console.log(ticket_id_list)
    for (var id in ticket_id_list) {
        var ticket_id = ticket_id_list[id];
        // Construct a query for this username
        var params = {
            TableName : "Tickets",
            Key: {
                ticketId : ticket_id
            }
        }
        promises.push(docClient.get(params).promise()
        .then((data) => {
            console.log("received ticket ", data);
            return data;
        })
        .catch((err) => {
            console.log("error " + err)
        }))
    };
    return Promise.all(promises)
}

function updateTicket(ticketId, updateJson) {
    // Updates the ticket with the update Json
    var columns = Object.keys(updateJson)
    var updateExp = "set ";
    var expAttrValues = {};
    for (var i = 0 ; i < columns.length ; i++) {
        updateExp += columns[i] + " = " + ":" + columns[i];
        if (i < columns.length - 1) {
            updateExp += ", "
        }
        
        expAttrValues[columns[i]] = updateJson.columns[i]
    }
    var params = {
        TableName: "Tickets",
        Key:{
            ticketId: ticketId
        },
        UpdateExpression : updateExp,
        ExpressionAttributeValues : expAttrValues,
        ReturnValues: "UPDATED_NEW"
    }
    
    return docClient.update(params).promise()
    
}

exports.getTicketsByIds = getTicketsByIds
exports.updateTicket = updateTicket