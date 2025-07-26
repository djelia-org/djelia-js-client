
const { 
    DjeliaRequest, 
    SupportedLanguageSchema, 
    TranslationResponse, 
    Versions 
} = require('../models/models');

class Translation {
    constructor(client) {
        this.client = client;
    }
    
    async getSupportedLanguages() {
        const endpoint = DjeliaRequest.getSupportedLanguages.endpoint
            .replace('{}', Versions.v1);
        
        const response = await this.client._makeRequest(
            DjeliaRequest.getSupportedLanguages.method,
            endpoint
        );
        
        return response.data.map(lang => SupportedLanguageSchema.fromJSON(lang));
    }
    
    async translate(request, version = Versions.v1) {
        request.validate();
        
        const endpoint = DjeliaRequest.translate.endpoint
            .replace('{}', version);
        
        const response = await this.client._makeRequest(
            DjeliaRequest.translate.method,
            endpoint,
            {
                data: request.toJSON()
            }
        );
        
        return TranslationResponse.fromJSON(response.data);
    }
}

module.exports = { Translation };