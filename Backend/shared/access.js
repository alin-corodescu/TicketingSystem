var AWS = require('aws-sdk');

var docClient = new AWS.DynamoDB.DocumentClient();

function getGroupsForUser(username) {
    // Query dynamoDB to return the groups of this user

    var params = {
        TableName: "Groups",
        KeyConditionExpression: "#usr = :user",
        ExpressionAttributeNames: {
            "#usr": "username"
        },
        ExpressionAttributeValues: {
            ":user": username
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
        console.log("Querying for user: " + username)
        // Construct a query for this username
        var params = {
            TableName: "TicketsAccess",
            KeyConditionExpression: "#usr = :user",
            ExpressionAttributeNames: {
                "#usr": "username"
            },
            ExpressionAttributeValues: {
                ":user": username
            },
            ProjectionExpression: "ticketId"

        }

        promises.push(docClient.query(params).promise()
            .then((data) => {
                console.log(JSON.stringify(data.Items))
                return data.Items.map((x) => { return x.ticketId })
            })
            .catch((err) => {
                console.log("error " + err)
            }))
    };
    return Promise.all(promises)
        .then((data) => {
            var unioned = data.reduce((x, y) => { return x.concat(y) }, [])
            console.log("Unioned = " + JSON.stringify(unioned));

            return unioned.filter(function(item, pos) {
                return unioned.indexOf(item) == pos;
            })
        })
}

function checkUserHasAccess(user_id, ticket_id) {
    // check if the user has access to the ticket,
    // basically it has to query if the entry exists in the table
    return getGroupsForUser(user_id)
        .then((groups) => {
            var identifiers = groups;
            var promises = []
            identifiers.push(user_id)
            for (var i in identifiers) {
                var params = {
                    TableName: "TicketsAccess",
                    Key: {
                        ticketId: ticket_id,
                        username: identifiers[i]
                    }
                }
                console.log("Querying for " + identifiers[i])
                var promise = docClient.get(params).promise()
                    .then((data) => {
                        console.log("Query response data" + JSON.stringify(data))
                        if (data.Item)
                            return true;
                        return false;
                    })
                    .catch((err) => {
                        // assume the error is because the entry does not exist
                        console.log("error " + err)
                        return false;
                    })
                promises.push(promise)
            }

            return Promise.all(promises).then((results) => {
                    console.log("returning actual data " + results);
                    var hasAccess = results.some((x) => { return x === true })
                    if (hasAccess)
                        return Promise.resolve(true);
                    return Promise.reject(false);
                },
                (err) => {
                    console.log(err);
                    return false;
                })
        })

}

function updateAccessToTicket(ticketId, accessPolicy) {
    // Read the access policy and grant permissions to the necessary users
    var user = accessPolicy.target;
    var type = accessPolicy.type;

    if (type === "GRANT") {
        return docClient.put({
            TableName: "TicketsAccess",
            Item: {
                ticketId: ticketId,
                username: user
            }
        }).promise()
    }
    else {
        return docClient.delete({
            TableName: "TicketsAccess",
            Key: {
                ticketId: ticketId,
                username: user
            }
        }).promise().catch((err) => {
            console.log("deletion error " + err)
        })
    }
}

function getUsersWhoCanAccessTicket(ticket_id) {
    var params = {
        TableName: "TicketsAccess",
        IndexName: "ticketId-index",
        KeyConditionExpression: "ticketId = :ticket_id",
        ExpressionAttributeValues: {
            ":ticket_id" : ticket_id
        },
        ProjectionExpression: "username"
    }
    var promise = docClient.query(params).promise()
    .then((data) => {
        return data.Items.map((x) => { return x.username })
    })
    .catch((err) => {
        console.log("err on access getter " +err )
    })
    return promise;
}

exports.getGroupsForUser = getGroupsForUser
exports.getTicketsAccessibleBy = getTicketsAccessibleBy
exports.checkUserHasAccess = checkUserHasAccess
exports.updateAccessToTicket = updateAccessToTicket
exports.getUsersWhoCanAccessTicket = getUsersWhoCanAccessTicket