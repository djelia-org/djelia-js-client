const fs = require('fs');
const { Djelia, Versions } = require('../index');

describe('Transcription Service', () => {
    let client;
    const audioFile = process.env.TEST_AUDIO_FILE || 'test-audio.wav';
    
    beforeAll(() => {
        if (process.env.DJELIA_API_KEY) {
            client = new Djelia(process.env.DJELIA_API_KEY);
        }
    });
    
    test('should handle missing audio file', async () => {
        if (!client) {
            console.warn('Skipping API test - no API key provided');
            return;
        }
        
        await expect(
            client.transcription.transcribe('nonexistent.wav')
        ).rejects.toThrow();
    });
    
    test('should transcribe audio file if available', async () => {
        if (!client) {
            console.warn('Skipping API test - no API key provided');
            return;
        }
        
        if (!fs.existsSync(audioFile)) {
            console.warn(`Skipping transcription test - audio file not found: ${audioFile}`);
            return;
        }
        
        const transcription = await client.transcription.transcribe(
            audioFile, 
            false, 
            false, 
            Versions.v2
        );
        
        expect(Array.isArray(transcription)).toBe(true);
        if (transcription.length > 0) {
            expect(transcription[0]).toHaveProperty('text');
            expect(transcription[0]).toHaveProperty('start');
            expect(transcription[0]).toHaveProperty('end');
        }
    }, 30000);
    
    test('should handle French translation', async () => {
        if (!client) {
            console.warn('Skipping API test - no API key provided');
            return;
        }
        
        if (!fs.existsSync(audioFile)) {
            console.warn(`Skipping French transcription test - audio file not found: ${audioFile}`);
            return;
        }
        
        const frenchResult = await client.transcription.transcribe(
            audioFile,
            true, // translateToFrench
            false,
            Versions.v2
        );
        
        expect(frenchResult).toHaveProperty('text');
        expect(typeof frenchResult.text).toBe('string');
    }, 30000);
    
    test('should handle streaming transcription', async () => {
        if (!client) {
            console.warn('Skipping API test - no API key provided');
            return;
        }
        
        if (!fs.existsSync(audioFile)) {
            console.warn(`Skipping streaming test - audio file not found: ${audioFile}`);
            return;
        }
        
        const stream = await client.transcription.transcribe(
            audioFile,
            false,
            true, // stream
            Versions.v2
        );
        
        let segmentCount = 0;
        for await (const segment of stream) {
            expect(segment).toHaveProperty('text');
            segmentCount++;
            if (segmentCount >= 2) break; // Limit for testing
        }
        
        expect(segmentCount).toBeGreaterThan(0);
    }, 30000);
});