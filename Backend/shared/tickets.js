
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
    console.log(updateJson);
    var columns = Object.keys(updateJson)
    console.log(columns)
    var updateExp = "set ";
    var expAttrValues = {};
    var expAttrNames = {};
    for (var i = 0 ; i < columns.length ; i++) {
        console.log(columns[i])
        updateExp += "#" + columns[i] + " = " + ":" + columns[i];
        if (i < columns.length - 1) {
            updateExp += ", "
        }
        console.log(updateExp);
        expAttrValues[":" + columns[i]] = updateJson[columns[i]]
        expAttrNames["#" + columns[i]] = columns[i];
    }
    console.log(updateExp);
    console.log(expAttrValues);
    var params = {
        TableName: "Tickets",
        Key:{
            ticketId: ticketId
        },
        UpdateExpression : updateExp,
        ExpressionAttributeValues : expAttrValues,
        ExpressionAttributeNames : expAttrNames,
        ReturnValues: "UPDATED_NEW"
    }
    
    return docClient.update(params).promise()
    .catch((err) => {
        console.log("update on ticket error : " + err);
    })
    
}

exports.getTicketsByIds = getTicketsByIds
exports.updateTicket = updateTicket