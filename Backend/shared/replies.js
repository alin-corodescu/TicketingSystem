function getRepliesForTicket(ticketId) {
    // TODO needs to query dynamoDB by ticket id and sort by date
    return ["Salut", "Salut"]
}

function addReplyToTicket(ticketId, reply, sender) {
    var wrappedReply = wrapReply(reply, sender)
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