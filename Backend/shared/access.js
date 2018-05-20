
function getGroupsForUser(username) {
    return ["1"]   
}

function getTicketsAccessibleBy(identifier_list) {
    return ["t1"]
}

function checkUserHasAccess(user_id, ticket_id) {
    return true;
}

exports.getGroupsForUser = getGroupsForUser
exports.getTicketsAccessibleBy = getTicketsAccessibleBy