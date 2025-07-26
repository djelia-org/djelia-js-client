const { Djelia, Language, TranslationRequest, Versions } = require('../index');

describe('Translation Service', () => {
    let client;
    
    beforeAll(() => {
        if (process.env.DJELIA_API_KEY) {
            client = new Djelia(process.env.DJELIA_API_KEY);
        }
    });
    
    test('should create translation request', () => {
        const request = new TranslationRequest(
            'Hello',
            Language.ENGLISH,
            Language.BAMBARA
        );
        
        expect(request.text).toBe('Hello');
        expect(request.source).toBe(Language.ENGLISH);
        expect(request.target).toBe(Language.BAMBARA);
    });
    
    test('should validate translation request', () => {
        const request = new TranslationRequest(
            'Hello',
            Language.ENGLISH,
            Language.BAMBARA
        );
        
        expect(() => request.validate()).not.toThrow();
    });
    
    test('should throw error for empty text', () => {
        const request = new TranslationRequest(
            '',
            Language.ENGLISH,
            Language.BAMBARA
        );
        
        expect(() => request.validate()).toThrow('Text is required and must be a string');
    });
    
    test('should translate text', async () => {
        if (!client) {
            console.warn('Skipping API test - no API key provided');
            return;
        }
        
        const request = new TranslationRequest(
            'Hello',
            Language.ENGLISH,
            Language.BAMBARA
        );
        
        const response = await client.translation.translate(request, Versions.v1);
        expect(response.text).toBeDefined();
        expect(typeof response.text).toBe('string');
        expect(response.text.length).toBeGreaterThan(0);
    }, 15000);
    
    test('should get supported languages', async () => {
        if (!client) {
            console.warn('Skipping API test - no API key provided');
            return;
        }
        
        const languages = await client.translation.getSupportedLanguages();
        expect(Array.isArray(languages)).toBe(true);
        expect(languages.length).toBeGreaterThan(0);
        
        // Check language structure
        const firstLang = languages[0];
        expect(firstLang).toHaveProperty('code');
        expect(firstLang).toHaveProperty('name');
    }, 15000);
});