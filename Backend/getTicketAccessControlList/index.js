
const access = require("../shared/access")
const utils = require("../shared/utils")


exports.handler = (event, context, callback) => {
    
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
        return access.getUsersWhoCanAccessTicket(ticketId)
    } ,(err) => {
        console.log(err);
        utils.normalResponse("Access denied", 403, callback)
    })
    .then((data) => {
        console.log("got data " + data)
        utils.normalResponse(JSON.stringify(data), 200, callback)
    })
};