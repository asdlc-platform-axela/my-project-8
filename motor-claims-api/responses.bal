import ballerina/http;
import ballerina/log;

function badRequest(string description) returns ErrorBadRequest {
    return {body: {code: 400, message: "Bad request", description}};
}

// Maps a store failure to its response. A missing or foreign claim is a 404,
// a refused state or content is a 400, anything else is a 500 with no detail.
function failureResponse(NotFoundError|RuleError|error outcome)
        returns ErrorBadRequest|ErrorNotFound|http:InternalServerError {
    if outcome is NotFoundError {
        return <ErrorNotFound>{body: {code: 404, message: "Not found", description: "No such claim for this caller"}};
    }
    if outcome is RuleError {
        return badRequest(outcome.message());
    }
    return internalError(outcome);
}

function internalError(error failure) returns http:InternalServerError {
    log:printError("claims request failed", 'error = failure);
    return <http:InternalServerError>{body: {code: 500, message: "Internal server error"}};
}
