const fs = require('fs');
const { Djelia, TTSRequest, TTSRequestV2, Versions } = require('../index');
const { SpeakerError } = require('../src/utils/exceptions');

describe('TTS Service', () => {
    let client;
    
    beforeAll(() => {
        if (process.env.DJELIA_API_KEY) {
            client = new Djelia(process.env.DJELIA_API_KEY);
        }
    });
    
    afterEach(() => {
        // Clean up generated audio files
        const testFiles = fs.readdirSync('.').filter(file => 
            file.startsWith('test_tts_') && file.endsWith('.wav')
        );
        testFiles.forEach(file => {
            try {
                fs.unlinkSync(file);
            } catch (e) {

            }
        });
    });
    
    test('should create TTS v1 request', () => {
        const request = new TTSRequest('Test text', 1);
        expect(request.text).toBe('Test text');
        expect(request.speaker).toBe(1);
    });
    
    test('should validate TTS v1 request', () => {
        const request = new TTSRequest('Test text', 1);
        expect(() => request.validate()).not.toThrow();
    });
    
    test('should throw error for invalid speaker ID', () => {
        const request = new TTSRequest('Test text', 99);
        expect(() => request.validate()).toThrow();
    });
    
    test('should create TTS v2 request', () => {
        const request = new TTSRequestV2(
            'Test text',
            'Moussa speaks clearly',
            1.0
        );
        expect(request.text).toBe('Test text');
        expect(request.description).toBe('Moussa speaks clearly');
        expect(request.chunkSize).toBe(1.0);
    });
    
    test('should validate TTS v2 request', () => {
        const request = new TTSRequestV2(
            'Test text',
            'Sekou speaks naturally'
        );
        expect(() => request.validate()).not.toThrow();
    });
    
    test('should throw error for text too long', () => {
        const longText = 'a'.repeat(1001);
        const request = new TTSRequestV2(longText, 'Moussa speaks');
        expect(() => request.validate()).toThrow('Text must be 1000 characters or less');
    });
    
    test('should generate TTS v1 audio', async () => {
        if (!client) {
            console.warn('Skipping API test - no API key provided');
            return;
        }
        
        const request = new TTSRequest('Test', 1);
        const outputFile = 'test_tts_v1.wav';
        
        const result = await client.tts.textToSpeech(
            request,
            outputFile,
            false,
            Versions.v1
        );
        
        expect(result).toBe(outputFile);
        expect(fs.existsSync(outputFile)).toBe(true);
    }, 20000);
    
    test('should generate TTS v2 audio', async () => {
        if (!client) {
            console.warn('Skipping API test - no API key provided');
            return;
        }
        
        const request = new TTSRequestV2(
            'Test audio',
            'Moussa speaks with clear tone'
        );
        const outputFile = 'test_tts_v2.wav';
        
        const result = await client.tts.textToSpeech(
            request,
            outputFile,
            false,
            Versions.v2
        );
        
        expect(result).toBe(outputFile);
        expect(fs.existsSync(outputFile)).toBe(true);
    }, 20000);
    
    test('should handle invalid speaker in TTS v1', async () => {
        if (!client) {
            console.warn('Skipping API test - no API key provided');
            return;
        }
        
        const request = new TTSRequest('Test', 99);
        
        await expect(
            client.tts.textToSpeech(request, null, false, Versions.v1)
        ).rejects.toThrow(SpeakerError);
    });
    
    test('should handle invalid speaker description in TTS v2', async () => {
        if (!client) {
            console.warn('Skipping API test - no API key provided');
            return;
        }
        
        const request = new TTSRequestV2('Test', 'Unknown speaker voice');
        
        await expect(
            client.tts.textToSpeech(request, null, false, Versions.v2)
        ).rejects.toThrow(SpeakerError);
    });
    
    test('should handle streaming TTS', async () => {
        if (!client) {
            console.warn('Skipping API test - no API key provided');
            return;
        }
        
        const request = new TTSRequestV2(
            'Streaming test text',
            'Seydou speaks naturally'
        );
        
        const stream = await client.tts.textToSpeech(
            request,
            'test_tts_stream.wav',
            true, // stream
            Versions.v2
        );
        
        let chunkCount = 0;
        let totalBytes = 0;
        
        for await (const chunk of stream) {
            expect(Buffer.isBuffer(chunk)).toBe(true);
            totalBytes += chunk.length;
            chunkCount++;
            if (chunkCount >= 3) break; // Limit for testing
        }
        
        expect(chunkCount).toBeGreaterThan(0);
        expect(totalBytes).toBeGreaterThan(0);
    }, 25000);
});