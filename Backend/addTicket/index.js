'use strict';

exports.handler = function(event, context, callback) {
    console.log(event);
    const response = {
        statusCode: 200,
        headers: {
            "x-custom-header": "My Header Value"
        },
        body: JSON.stringify({ "message": "Hello World!" })
    };
    callback(null, response);
};