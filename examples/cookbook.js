//  ================================================
//                   Djelia Cookbook
//  ================================================

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { 
    Djelia, 
    Language, 
    Versions, 
    TranslationRequest, 
    TTSRequest, 
    TTSRequestV2,
    AuthenticationError,
    APIError,
    ValidationError,
    LanguageError,
    SpeakerError
} = require('../index');


const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    purple: '\x1b[35m',
    blue: '\x1b[34m',
    gray: '\x1b[37m',
    reset: '\x1b[0m'
};

class DjeliaCookbook {
    constructor() {
        this.apiKey = process.env.DJELIA_API_KEY;
        this.audioFilePath = process.env.TEST_AUDIO_FILE || 'audio.wav';
        this.client = null;
        this.testResults = {};
        this.maxStreamSegments = 3;
        this.maxStreamChunks = 5;
        
        this.translationSamples = [
            ['Hello, how are you?', Language.ENGLISH, Language.BAMBARA],
            ['Bonjour, comment allez-vous?', Language.FRENCH, Language.BAMBARA],
            ['Good morning', Language.ENGLISH, Language.FRENCH]
        ];
        
        this.bambaraTtsText = 'Aw ni ce, i ka kɛnɛ wa?';
        this.supportedSpeakers = ['Moussa', 'Sekou', 'Seydou'];
    }
    
    printSuccess(message) {
        console.log(`${colors.green}✓ ${message}${colors.reset}`);
    }
    
    printError(message) {
        console.log(`${colors.red}✗ ${message}${colors.reset}`);
    }
    
    printInfo(message) {
        console.log(`${colors.gray}ℹ ${message}${colors.reset}`);
    }
    
    printHeader(title) {
        console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
        console.log(`${colors.yellow}${title.padStart(title.length + 30).padEnd(60)}${colors.reset}`);
        console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    }
    
    // # ------------------------------
    // # Setup Validation
    // # ------------------------------
    validateSetup() {
        let valid = true;
        
        if (!this.apiKey) {
            this.printError('DJELIA_API_KEY not found in environment variables');
            valid = false;
        }
        
        if (!fs.existsSync(this.audioFilePath)) {
            this.printError(`Audio file not found: ${this.audioFilePath}`);
            valid = false;
        }
        
        if (valid) {
            this.printSuccess('API Key and audio file loaded');
            this.client = new Djelia(this.apiKey);
        }
        
        return valid;
    }
    
    // # ------------------------------
    // # Translation Tests
    // # ------------------------------

    async testTranslation() {
        const testName = 'Translation';
        this.printHeader('TRANSLATION TESTS');
        
        try {
            const languages = await this.client.translation.getSupportedLanguages();
            this.printSuccess(`Supported languages: ${languages.length}`);
            
            for (const [text, source, target] of this.translationSamples) {
                const request = new TranslationRequest(text, source, target);
                const response = await this.client.translation.translate(request, Versions.v1);
                this.printSuccess(
                    `${source} → ${target}: '${text}' → '${colors.yellow}${response.text}${colors.reset}'`
                );
            }
            
            this.testResults[testName] = ['Success', `${this.translationSamples.length} translations`];
            
        } catch (error) {
            this.printError(`Translation error: ${error.message}`);
            this.testResults[testName] = ['Failed', error.message];
        }
    }
    
 
    // # ------------------------------
    // # Transcription Tests
    // # ------------------------------

    async testTranscription() {
        const testName = 'Transcription';
        this.printHeader('TRANSCRIPTION TESTS');
        
        if (!fs.existsSync(this.audioFilePath)) {
            this.printError('Audio file missing');
            this.testResults[testName] = ['Failed', 'Missing audio file'];
            return;
        }
        
        try {
  
            for (const version of [Versions.v1, Versions.v2]) {
                this.printInfo(`Testing non-streaming v${version}`);
                const transcription = await this.client.transcription.transcribe(
                    this.audioFilePath, 
                    false, 
                    false, 
                    version
                );
                
                if (Array.isArray(transcription) && transcription.length > 0) {
                    this.printSuccess(`Transcription v${version}: ${transcription.length} segments`);
                    const segment = transcription[0];
                    this.printSuccess(
                        `Sample: ${segment.start.toFixed(1)}s-${segment.end.toFixed(1)}s: '${colors.yellow}${segment.text}${colors.reset}'`
                    );
                }
                
                if (version === Versions.v2) {
                    this.printInfo('Testing French translation');
                    const frenchTranscription = await this.client.transcription.transcribe(
                        this.audioFilePath,
                        true,
                        false,
                        version
                    );
                    this.printSuccess(
                        `French translation: '${colors.yellow}${frenchTranscription.text}${colors.reset}'`
                    );
                }
            }
            
            this.testResults[testName] = ['Success', 'All versions completed'];
            
        } catch (error) {
            this.printError(`Transcription error: ${error.message}`);
            this.testResults[testName] = ['Failed', error.message];
        }
    }
    

    // # ------------------------------
    // # Streaming Transcription
    // # ------------------------------

    async testStreamingTranscription() {
        const testName = 'Streaming Transcription';
        this.printHeader('STREAMING TRANSCRIPTION TESTS');
        
        if (!fs.existsSync(this.audioFilePath)) {
            this.printError('Audio file missing');
            this.testResults[testName] = ['Failed', 'Missing audio file'];
            return;
        }
        
        try {
            for (const version of [Versions.v1, Versions.v2]) {
                this.printInfo(`Testing streaming v${version}`);
                let segmentCount = 0;
                
                const stream = await this.client.transcription.transcribe(
                    this.audioFilePath,
                    false,
                    true,
                    version
                );
                
                for await (const segment of stream) {
                    segmentCount++;
                    this.printSuccess(
                        `Segment ${segmentCount}: ${segment.start?.toFixed(2) || 0}s-${segment.end?.toFixed(2) || 0}s: '${colors.yellow}${segment.text}${colors.reset}'`
                    );
                    
                    if (segmentCount >= this.maxStreamSegments) {
                        this.printInfo(`Showing first ${this.maxStreamSegments} segments`);
                        break;
                    }
                }
                
                this.printSuccess(`Streaming complete: ${segmentCount} segments`);
            }
            
            this.testResults[testName] = ['Success', 'All versions completed'];
            
        } catch (error) {
            this.printError(`Streaming transcription error: ${error.message}`);
            this.testResults[testName] = ['Failed', error.message];
        }
    }
    

    // # ------------------------------
    // # TTS Tests
    // # ------------------------------

    async testTTS() {
        const testName = 'TTS';
        this.printHeader('TEXT-TO-SPEECH TESTS');
        
        try {

            const ttsRequestV1 = new TTSRequest(this.bambaraTtsText, 1);
            const audioFileV1 = await this.client.tts.textToSpeech(
                ttsRequestV1,
                `tts_v1_${Date.now()}.wav`,
                false,
                Versions.v1
            );
            this.printSuccess(`TTS v1 saved: ${colors.blue}${audioFileV1}${colors.reset}`);
            
            for (const speaker of this.supportedSpeakers) {
                const ttsRequestV2 = new TTSRequestV2(
                    this.bambaraTtsText,
                    `${speaker} speaks with natural tone`,
                    1.0
                );
                const audioFileV2 = await this.client.tts.textToSpeech(
                    ttsRequestV2,
                    `tts_v2_${speaker}_${Date.now()}.wav`,
                    false,
                    Versions.v2
                );
                this.printSuccess(`TTS v2 (${speaker}): ${colors.blue}${audioFileV2}${colors.reset}`);
            }
            
            this.testResults[testName] = ['Success', `${this.supportedSpeakers.length} speakers`];
            
        } catch (error) {
            this.printError(`TTS error: ${error.message}`);
            this.testResults[testName] = ['Failed', error.message];
        }
    }
    
    // # ------------------------------
    // # Streaming TTS
    // # ------------------------------

    async testStreamingTTS() {
        const testName = 'Streaming TTS';
        this.printHeader('STREAMING TTS TESTS');
        
        try {
            const ttsRequest = new TTSRequestV2(
                this.bambaraTtsText,
                `${this.supportedSpeakers[0]} speaks with natural conversational tone`
            );
            
            let chunkCount = 0;
            let totalBytes = 0;
            
            const stream = await this.client.tts.textToSpeech(
                ttsRequest,
                `stream_tts_${Date.now()}.wav`,
                true,
                Versions.v2
            );
            
            for await (const chunk of stream) {
                chunkCount++;
                totalBytes += chunk.length;
                this.printSuccess(`Chunk ${chunkCount}: ${chunk.length.toLocaleString()} bytes`);
                
                if (chunkCount >= this.maxStreamChunks) {
                    this.printInfo(`Showing first ${this.maxStreamChunks} chunks`);
                    break;
                }
            }
            
            this.printSuccess(
                `Streaming complete: ${chunkCount} chunks, ${colors.blue}${totalBytes.toLocaleString()} bytes${colors.reset}`
            );
            this.testResults[testName] = ['Success', `${chunkCount} chunks`];
            
        } catch (error) {
            this.printError(`Streaming TTS error: ${error.message}`);
            this.testResults[testName] = ['Failed', error.message];
        }
    }
    

    testVersionManagement() {
        const testName = 'Version Management';
        this.printHeader('VERSION MANAGEMENT');
        
        this.printSuccess(`Latest version: ${colors.yellow}v${Versions.latest()}${colors.reset}`);
        this.printSuccess(`Available versions: ${colors.gray}${Versions.allVersions().map(v => `v${v}`).join(', ')}`);
        
        this.testResults[testName] = ['Success', 'Version info displayed'];
    }
    
    // # ------------------------------
    // # Advanced Features
    // # ------------------------------

    async testParallelOperations() {
        const testName = 'Parallel Operations';
        this.printHeader('PARALLEL OPERATIONS');
        
        try {
            this.printInfo('Executing parallel operations...');
            
            const translationRequest = new TranslationRequest('Hello', Language.ENGLISH, Language.BAMBARA);
            const ttsRequest = new TTSRequestV2(
                this.bambaraTtsText,
                `${this.supportedSpeakers[0]} speaks with clear tone`
            );
            
            const results = await Promise.allSettled([
                this.client.translation.getSupportedLanguages(),
                this.client.translation.translate(translationRequest, Versions.v1),
                this.client.transcription.transcribe(this.audioFilePath, false, false, Versions.v1),
                this.client.tts.textToSpeech(ttsRequest, `parallel_tts_${Date.now()}.wav`, false, Versions.v2)
            ]);
            
            console.log(`\n${colors.cyan}Parallel Results:${colors.reset}`);
            results.forEach((result, index) => {
                const operations = ['Languages', 'Translation', 'Transcription', 'TTS Output'];
                if (result.status === 'fulfilled') {
                    this.printSuccess(`${operations[index]}: Received ${result.value.constructor.name}`);
                } else {
                    this.printError(`${operations[index]}: ${result.reason.message}`);
                }
            });
            
            const successful = results.filter(r => r.status === 'fulfilled').length;
            this.testResults[testName] = ['Success', `${successful}/4 operations completed`];
            
        } catch (error) {
            this.printError(`Parallel operations error: ${error.message}`);
            this.testResults[testName] = ['Failed', error.message];
        }
    }
    
    // # ------------------------------
    // # Let's test errors 
    // # ------------------------------
    async testErrorHandling() {
        const testName = 'Error Handling';
        this.printHeader('ERROR HANDLING TESTS');
        
        try {
            // Test invalid API key
            const invalidClient = new Djelia('invalid-key');
            await invalidClient.translation.getSupportedLanguages();
        } catch (error) {
            if (error instanceof AuthenticationError) {
                this.printSuccess('Authentication error caught correctly');
            } else {
                this.printError(`Unexpected error type: ${error.constructor.name}`);
            }
        }
        
        try {
            // Test invalid speaker
            const invalidTTSRequest = new TTSRequest(this.bambaraTtsText, 99);
            await this.client.tts.textToSpeech(invalidTTSRequest, null, false, Versions.v1);
        } catch (error) {
            if (error instanceof SpeakerError) {
                this.printSuccess('Speaker error caught correctly');
            } else {
                this.printError(`Unexpected error type: ${error.constructor.name}`);
            }
        }
        
        this.testResults[testName] = ['Success', 'Error handling verified'];
    }
    

    printSummary() {
        this.printHeader('TEST SUMMARY');
        console.log(`${'Test'.padEnd(40)} ${'Status'.padEnd(10)} Details`);
        console.log(`${colors.gray}${'-'.repeat(60)}${colors.reset}`);
        
        for (const [test, [status, details]] of Object.entries(this.testResults)) {
            const color = status === 'Success' ? colors.green : colors.red;
            console.log(`${test.padEnd(40)} ${color}${status.padEnd(10)}${colors.reset} ${details}`);
        }
    }
    

    // LET's GOOOOO

    async run() {
        this.printHeader('DJELIA SDK JAVASCRIPT COOKBOOK');
        
        if (!this.validateSetup()) {
            return;
        }
        
        try {
            await this.testTranslation();
            await this.testTranscription();
            await this.testStreamingTranscription();
            await this.testTTS();
            await this.testStreamingTTS();
            this.testVersionManagement();
            await this.testParallelOperations();
            await this.testErrorHandling();
            
            this.printSummary();
            
        } catch (error) {
            this.printError(`Unexpected error: ${error.message}`);
            this.testResults['Overall'] = ['Failed', 'Runtime error'];
            this.printSummary();
        }
    }
}


if (require.main === module) {
    const cookbook = new DjeliaCookbook();
    cookbook.run().catch(console.error);
}

module.exports = DjeliaCookbook;