const { Djelia, Language, TranslationRequest, Versions } = require('../index');
const { AuthenticationError } = require('../src/utils/exceptions');

describe('Djelia Client', () => {
    let client;
    
    beforeEach(() => {
        if (process.env.DJELIA_API_KEY) {
            client = new Djelia(process.env.DJELIA_API_KEY);
        }
    });
    
    test('should initialize with valid UUID API key', () => {
        expect(() => {
            new Djelia('12345678-1234-4567-89ab-123456789abc'); // Valid UUID format
        }).not.toThrow();
    });
    
    test('should throw error with invalid API key format', () => {
        expect(() => {
            new Djelia('invalid-key-format');
        }).toThrow('API key must be provided via parameter or environment variable');
    });
    
    test('should throw error with null API key when no env variable', () => {
        const originalApiKey = process.env.DJELIA_API_KEY;
        delete process.env.DJELIA_API_KEY;
        
        expect(() => {
            new Djelia(null);
        }).toThrow('API key must be provided via parameter or environment variable');
        
        if (originalApiKey) {
            process.env.DJELIA_API_KEY = originalApiKey;
        }
    });
    
    test('should throw error with undefined API key', () => {
        const originalApiKey = process.env.DJELIA_API_KEY;
        delete process.env.DJELIA_API_KEY;
        
        expect(() => {
            new Djelia(undefined);
        }).toThrow('API key must be provided via parameter or environment variable');
        
        if (originalApiKey) {
            process.env.DJELIA_API_KEY = originalApiKey;
        }
    });
    
    test('should create client services', () => {
        if (!process.env.DJELIA_API_KEY) {
            console.warn('Skipping API test - no API key provided');
            return;
        }
        
        expect(client.translation).toBeDefined();
        expect(client.transcription).toBeDefined();
        expect(client.tts).toBeDefined();
    });
    
    test('should get supported languages', async () => {
        if (!client) {
            console.warn('Skipping API test - no API key provided');
            return;
        }
        
        const languages = await client.translation.getSupportedLanguages();
        expect(Array.isArray(languages)).toBe(true);
        expect(languages.length).toBeGreaterThan(0);
        expect(languages[0]).toHaveProperty('code');
        expect(languages[0]).toHaveProperty('name');
    }, 15000);
});