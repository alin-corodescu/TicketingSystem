function defaultErrorHandler(err, context, callback) {
    console.error(err)
    errorResponse(err.message, context.awsRequestId, callback)
}

function errorResponse(errorMessage, awsRequestId, callback) {
  callback(null, {
    statusCode: 502,
    body: JSON.stringify({
      Error: errorMessage,
      Reference: awsRequestId,
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function normalResponse(content, statusCode, callback) {
    callback(null, {
    statusCode: statusCode,
    body: content,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}

function getUsernameForRequest(event, callback) {
    var username = "Coro"
    if (event.requestContext.hasOwnProperty("authorizer") && event.requestContext.authorizer) {
        console.log("Authorizer has been set");
        username = event.requestContext.authorizer.claims['cognito:username'];
    }
    
    return username;
}

exports.defaultErrorHandler = defaultErrorHandler
exports.errorResponse = errorResponse
exports.normalResponse = normalResponse
exports.getUsernameForRequest = getUsernameForRequest