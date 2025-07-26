
const Language = {
    FRENCH: 'fra_Latn',
    ENGLISH: 'eng_Latn',
    BAMBARA: 'bam_Latn'
};


const Versions = {
    v1: 1,
    v2: 2,
    
    latest() {
        return Math.max(...Object.values(this).filter(v => typeof v === 'number'));
    },
    
    allVersions() {
        return Object.values(this).filter(v => typeof v === 'number').sort();
    },
    
    toString(version) {
        return `v${version}`;
    }
};


class HttpRequestInfo {
    constructor(endpoint, method) {
        this.endpoint = endpoint;
        this.method = method;
    }
}


class DjeliaRequest {
    static endpointPrefix = 'https://djelia.cloud/api/v{}/models/';
    
    static getSupportedLanguages = new HttpRequestInfo(
        this.endpointPrefix + 'translate/supported-languages',
        'GET'
    );
    
    static translate = new HttpRequestInfo(
        this.endpointPrefix + 'translate',
        'POST'
    );
    
    static transcribe = new HttpRequestInfo(
        this.endpointPrefix + 'transcribe',
        'POST'
    );
    
    static transcribeStream = new HttpRequestInfo(
        this.endpointPrefix + 'transcribe/stream',
        'POST'
    );
    
    static tts = new HttpRequestInfo(
        this.endpointPrefix + 'tts',
        'POST'
    );
    
    static ttsStream = new HttpRequestInfo(
        this.endpointPrefix + 'tts/stream',
        'POST'
    );
}


class TranslationRequest {
    constructor(text, source, target) {
        this.text = text;
        this.source = source;
        this.target = target;
    }
    
    validate() {
        if (!this.text || typeof this.text !== 'string') {
            throw new Error('Text is required and must be a string');
        }
        if (!Object.values(Language).includes(this.source)) {
            throw new Error('Invalid source language');
        }
        if (!Object.values(Language).includes(this.target)) {
            throw new Error('Invalid target language');
        }
    }
    
    toJSON() {
        return {
            text: this.text,
            source: this.source,
            target: this.target
        };
    }
}

class TTSRequest {
    constructor(text, speaker = 1) {
        this.text = text;
        this.speaker = speaker;
    }
    
    validate() {
        if (!this.text || typeof this.text !== 'string') {
            throw new Error('Text is required and must be a string');
        }
        if (!Number.isInteger(this.speaker) || this.speaker < 0 || this.speaker > 4) {
            throw new Error('Speaker must be an integer between 0 and 4');
        }
    }
    
    toJSON() {
        return {
            text: this.text,
            speaker: this.speaker
        };
    }
}

class TTSRequestV2 {
    constructor(text, description, chunkSize = 1.0) {
        this.text = text;
        this.description = description;
        this.chunkSize = chunkSize;
    }
    
    validate() {
        if (!this.text || typeof this.text !== 'string') {
            throw new Error('Text is required and must be a string');
        }
        if (this.text.length > 1000) {
            throw new Error('Text must be 1000 characters or less');
        }
        if (!this.description || typeof this.description !== 'string') {
            throw new Error('Description is required and must be a string');
        }
        if (typeof this.chunkSize !== 'number' || this.chunkSize < 0.1 || this.chunkSize > 2.0) {
            throw new Error('Chunk size must be a number between 0.1 and 2.0');
        }
    }
    
    toJSON() {
        return {
            text: this.text,
            description: this.description,
            chunk_size: this.chunkSize
        };
    }
}

class SupportedLanguageSchema {
    constructor(code, name) {
        this.code = code;
        this.name = name;
    }
    
    static fromJSON(data) {
        return new SupportedLanguageSchema(data.code, data.name);
    }
}

class TranslationResponse {
    constructor(text) {
        this.text = text;
    }
    
    static fromJSON(data) {
        return new TranslationResponse(data.text);
    }
}

class TranscriptionSegment {
    constructor(text, start, end) {
        this.text = text;
        this.start = start;
        this.end = end;
    }
    
    static fromJSON(data) {
        return new TranscriptionSegment(data.text, data.start, data.end);
    }
}

class FrenchTranscriptionResponse {
    constructor(text) {
        this.text = text;
    }
    
    static fromJSON(data) {
        return new FrenchTranscriptionResponse(data.text);
    }
}


const Params = {
    file: 'file',
    translateToFrench: 'translate_to_french',
    filename: 'audio_file'
};


const ErrorsMessage = {
    ioErrorSave: 'Failed to save audio file: {}',
    ioErrorRead: 'Could not read audio file: {}',
    speakerDescriptionError: 'Description must contain one of the supported speakers: {}',
    speakerIdError: 'Speaker ID must be one of {}, got {}',
    apiKeyMissing: 'API key must be provided via parameter or environment variable',
    ttsV1RequestError: 'TTSRequest required for V1',
    ttsV2RequestError: 'TTSRequestV2 required for V2',
    ttsStreamingCompatibility: 'Streaming is only available for TTS V2'
};

module.exports = {
    Language,
    Versions,
    HttpRequestInfo,
    DjeliaRequest,
    TranslationRequest,
    TTSRequest,
    TTSRequestV2,
    SupportedLanguageSchema,
    TranslationResponse,
    TranscriptionSegment,
    FrenchTranscriptionResponse,
    Params,
    ErrorsMessage
};