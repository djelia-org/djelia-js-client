const { isValidUUID } = require('../utils/utils');
const { ErrorsMessage } = require('../models/models');

class Auth {
    constructor(apiKey = null) {
        this.apiKey = apiKey;
        
        if (!this.apiKey || !isValidUUID(this.apiKey)) {
            throw new Error(ErrorsMessage.apiKeyMissing);
        }
    }
    
    getHeaders() {
        return {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
        };
    }
    
    getHeadersForFormData() {
        return {
            'x-api-key': this.apiKey
        };
    }
}

module.exports = { Auth };