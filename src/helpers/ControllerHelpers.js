function jsonBody(body) {
    try {
        return JSON.parse(body);
    }
    catch (e) {
        return undefined;
    }
}

function response(type, data, statusCode) {
    return {
        statusCode: statusCode || 200,
        type: type,
        data: data
    };
}

module.exports = {
    jsonBody,
    response
};