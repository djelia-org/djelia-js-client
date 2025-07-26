const { Djelia } = require('./src/client/client');
const { 
    Language, 
    Versions, 
    TranslationRequest, 
    TTSRequest, 
    TTSRequestV2 
} = require('./src/models/models');
const {
    DjeliaError,
    AuthenticationError,
    ValidationError,
    APIError,
    LanguageError,
    SpeakerError
} = require('./src/utils/exceptions');

module.exports = {
    Djelia,
    Language,
    Versions,
    TranslationRequest,
    TTSRequest,
    TTSRequestV2,

    DjeliaError,
    AuthenticationError,
    ValidationError,
    APIError,
    LanguageError,
    SpeakerError
};