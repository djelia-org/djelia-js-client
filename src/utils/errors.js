// src/utils/errors.js
const {
    APIError,
    AuthenticationError,
    DjeliaError,
    ValidationError
} = require('./exceptions');

const ExceptionMessage = {
    messages: {
        401: 'Invalid or expired API key',
        403: 'Forbidden: You do not have permission to access this resource',
        404: 'Resource not found',
        422: 'Validation error'
    },
    default: 'API error {}',
    failed: 'Request failed: {}'
};

const CodeStatusExceptions = {
    exceptions: {
        401: AuthenticationError,
        403: APIError,
        404: APIError,
        422: ValidationError
    },
    default: DjeliaError
};

function apiException(code, error) {
    const ExceptionClass = CodeStatusExceptions.exceptions[code] || APIError;
    const message = ExceptionMessage.messages[code] || 
                   ExceptionMessage.default.replace('{}', error.toString());
    
    if (ExceptionClass === APIError) {
        return new ExceptionClass(code, message);
    }
    return new ExceptionClass(message);
}

function generalException(error) {
    return new DjeliaError(ExceptionMessage.failed.replace('{}', error.toString()));
}

module.exports = { apiException, generalException };