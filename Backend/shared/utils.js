function defaultErrorHandler(err, context, callback) {
    console.error(err)
    errorResponse(err.message, context.awsRequestId, callback)
}

function errorResponse(errorMessage, awsRequestId, callback) {
  callback(null, {
    statusCode: 500,
    body: JSON.stringify({
      Error: errorMessage,
      Reference: awsRequestId,
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}

exports.defaultErrorHandler = defaultErrorHandler
exports.errorResponse = errorResponse