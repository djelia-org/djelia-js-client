
const fs = require('fs').promises;
const { 
    DjeliaRequest, 
    TTSRequest, 
    TTSRequestV2, 
    ErrorsMessage, 
    Versions 
} = require('../models/models');
const { SpeakerError } = require('../utils/exceptions');

class TTS {
    constructor(client) {
        this.client = client;
    }
    
    async textToSpeech(request, outputFile = null, stream = false, version = Versions.v1) {

        if (version === Versions.v1) {
            if (!(request instanceof TTSRequest)) {
                throw new Error(ErrorsMessage.ttsV1RequestError);
            }
            if (!this.client.settings.validSpeakerIds.includes(request.speaker)) {
                throw new SpeakerError(
                    ErrorsMessage.speakerIdError
                        .replace('{}', this.client.settings.validSpeakerIds.join(', '))
                        .replace('{}', request.speaker)
                );
            }
        } else {
            if (!(request instanceof TTSRequestV2)) {
                throw new Error(ErrorsMessage.ttsV2RequestError);
            }
            const speakerFound = this.client.settings.validTtsV2Speakers.some(
                speaker => request.description.toLowerCase().includes(speaker.toLowerCase())
            );
            if (!speakerFound) {
                throw new SpeakerError(
                    ErrorsMessage.speakerDescriptionError
                        .replace('{}', this.client.settings.validTtsV2Speakers.join(', '))
                );
            }
        }
        
        request.validate();
        
        if (!stream) {
            return this._textToSpeechNonStreaming(request, outputFile, version);
        } else {
            if (version === Versions.v1) {
                throw new Error(ErrorsMessage.ttsStreamingCompatibility);
            }
            return this._textToSpeechStreaming(request, outputFile, version);
        }
    }
    
    async _textToSpeechNonStreaming(request, outputFile, version) {
        const endpoint = DjeliaRequest.tts.endpoint.replace('{}', version);
        
        const response = await this.client._makeRequest(
            DjeliaRequest.tts.method,
            endpoint,
            {
                data: request.toJSON(),
                responseType: 'arraybuffer'
            }
        );
        
        const audioData = Buffer.from(response.data);
        
        if (outputFile) {
            try {
                await fs.writeFile(outputFile, audioData);
                return outputFile;
            } catch (error) {
                throw new Error(ErrorsMessage.ioErrorSave.replace('{}', error.message));
            }
        } else {
            return audioData;
        }
    }
    
    async *_textToSpeechStreaming(request, outputFile, version) {
        const endpoint = DjeliaRequest.ttsStream.endpoint.replace('{}', version);
        
        const response = await this.client._makeStreamingRequest(
            DjeliaRequest.ttsStream.method,
            endpoint,
            {
                data: request.toJSON(),
                responseType: 'stream'
            }
        );
        
        const audioChunks = [];
        
        for await (const chunk of response.data) {
            if (chunk) {
                audioChunks.push(chunk);
                yield chunk;
            }
        }
        
        if (outputFile) {
            try {
                const audioData = Buffer.concat(audioChunks);
                await fs.writeFile(outputFile, audioData);
            } catch (error) {
                throw new Error(ErrorsMessage.ioErrorSave.replace('{}', error.message));
            }
        }
    }
}

module.exports = { TTS };