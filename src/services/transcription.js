
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const { 
    DjeliaRequest, 
    TranscriptionSegment, 
    FrenchTranscriptionResponse, 
    Params, 
    ErrorsMessage,
    Versions 
} = require('../models/models');

class Transcription {
    constructor(client) {
        this.client = client;
    }
    
    async transcribe(audioFile, translateToFrench = false, stream = false, version = Versions.v2) {
        if (!stream) {
            return this._transcribeNonStreaming(audioFile, translateToFrench, version);
        } else {
            return this._transcribeStreaming(audioFile, translateToFrench, version);
        }
    }
    
    async _transcribeNonStreaming(audioFile, translateToFrench, version) {
        try {
            const formData = new FormData();
            
            if (typeof audioFile === 'string') {
     
                if (!fs.existsSync(audioFile)) {
                    throw new Error(`Audio file not found: ${audioFile}`);
                }
                formData.append(Params.file, fs.createReadStream(audioFile));
            } else if (audioFile instanceof Buffer) {
         
                formData.append(Params.file, audioFile, 'audio_file');
            } else {
                throw new Error('Audio file must be a file path string or Buffer');
            }
            
            const endpoint = DjeliaRequest.transcribe.endpoint
                .replace('{}', version);
            
            const params = { [Params.translateToFrench]: translateToFrench.toString() };
            
            const response = await this.client._makeRequest(
                DjeliaRequest.transcribe.method,
                endpoint,
                {
                    data: formData,
                    params,
                    headers: {
                        ...this.client.auth.getHeadersForFormData(),
                        ...formData.getHeaders()
                    }
                }
            );
            
            if (translateToFrench) {
                return FrenchTranscriptionResponse.fromJSON(response.data);
            } else {
                return response.data.map(segment => TranscriptionSegment.fromJSON(segment));
            }
            
        } catch (error) {
            if (error.code === 'ENOENT' || error.code === 'EACCES') {
                throw new Error(ErrorsMessage.ioErrorRead.replace('{}', error.message));
            }
            throw error;
        }
    }
    
    async *_transcribeStreaming(audioFile, translateToFrench, version) {
        try {
            const formData = new FormData();
            
            if (typeof audioFile === 'string') {
                if (!fs.existsSync(audioFile)) {
                    throw new Error(`Audio file not found: ${audioFile}`);
                }
                formData.append(Params.file, fs.createReadStream(audioFile));
            } else if (audioFile instanceof Buffer) {
                formData.append(Params.file, audioFile, 'audio_file');
            } else {
                throw new Error('Audio file must be a file path string or Buffer');
            }
            
            const endpoint = DjeliaRequest.transcribeStream.endpoint
                .replace('{}', version);
            
            const params = { [Params.translateToFrench]: translateToFrench.toString() };
            
            const response = await this.client._makeStreamingRequest(
                DjeliaRequest.transcribeStream.method,
                endpoint,
                {
                    data: formData,
                    params,
                    headers: {
                        ...this.client.auth.getHeadersForFormData(),
                        ...formData.getHeaders()
                    }
                }
            );
            
            let buffer = '';
            
            for await (const chunk of response.data) {
                buffer += chunk.toString();
                const lines = buffer.split('\n');
                buffer = lines.pop(); 
                
                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const data = JSON.parse(line);
                            
                            if (Array.isArray(data)) {
                                for (const segment of data) {
                                    yield translateToFrench 
                                        ? FrenchTranscriptionResponse.fromJSON(segment)
                                        : TranscriptionSegment.fromJSON(segment);
                                }
                            } else {
                                yield translateToFrench 
                                    ? FrenchTranscriptionResponse.fromJSON(data)
                                    : TranscriptionSegment.fromJSON(data);
                            }
                        } catch (parseError) {
    
                            continue;
                        }
                    }
                }
            }
            
 
            if (buffer.trim()) {
                try {
                    const data = JSON.parse(buffer);
                    if (Array.isArray(data)) {
                        for (const segment of data) {
                            yield translateToFrench 
                                ? FrenchTranscriptionResponse.fromJSON(segment)
                                : TranscriptionSegment.fromJSON(segment);
                        }
                    } else {
                        yield translateToFrench 
                            ? FrenchTranscriptionResponse.fromJSON(data)
                            : TranscriptionSegment.fromJSON(data);
                    }
                } catch (parseError) {
 
                }
            }
            
        } catch (error) {
            if (error.code === 'ENOENT' || error.code === 'EACCES') {
                throw new Error(ErrorsMessage.ioErrorRead.replace('{}', error.message));
            }
            throw error;
        }
    }
}

module.exports = { Transcription };