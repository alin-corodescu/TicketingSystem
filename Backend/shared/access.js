

var AWS = require('aws-sdk');

var docClient = new AWS.DynamoDB.DocumentClient();

function getGroupsForUser(username) {
    // Query dynamoDB to return the groups of this user
    
    var params = {
    TableName : "Groups",
    KeyConditionExpression: "#usr = :user",
    ExpressionAttributeNames:{
        "#usr": "username"
    },
    ExpressionAttributeValues: {
        ":user":username
    }
    };
    
    var op = docClient.query(params).promise()
    .then((data) => {
        return data.Items.map((x) => { return x.groupId });
    })
    .catch((err) => {
        console.log("Got a fucking error" + err);
    });
    
    return op;
}

function getTicketsAccessibleBy(identifier_list) {
    var promises = []
    for (var identifier in identifier_list) {
        var username = identifier_list[identifier];
        // Construct a query for this username
        var params = {
            TableName : "TicketsAccess",
            KeyConditionExpression: "#usr = :user",
            ExpressionAttributeNames:{
                "#usr": "username"
            },
            ExpressionAttributeValues: {
                ":user":username
            },
            ProjectionExpression:"ticketId"
            
        }
        
        promises.push(docClient.query(params).promise()
        .then((data) => {
            return data.Items.map((x) => { return x.ticketId })
        })
        .catch((err) => {
            console.log("error " + err)
        }))
    };
    return Promise.all(promises)
    .then((data) => {
        var unioned = data.reduce((x,y) => {return x.concat(y)}, [])
        console.log("Unioned = " + JSON.stringify(unioned));
        
        return unioned.filter(function(item, pos) {
            return unioned.indexOf(item) == pos;
        })
    })
}

function checkUserHasAccess(user_id, ticket_id) {
    return true;
}

function updateAccessToTicket(ticketId, accessPolicy) {
    // Read the access policy and grant permissions to the necessary users
}

exports.getGroupsForUser = getGroupsForUser
exports.getTicketsAccessibleBy = getTicketsAccessibleBy
exports.checkUserHasAccess = checkUserHasAccess
exports.updateAccessToTicket = updateAccessToTicket