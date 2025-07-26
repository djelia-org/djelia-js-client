# Djelia JavaScript SDK

> **Advanced AI for African Languages** 🇲🇱

Welcome to the Djelia JavaScript SDK! This powerful library enables seamless integration with Djelia's AI services for African languages, featuring translation, transcription, and text-to-speech capabilities. Built with modern JavaScript/Node.js, it offers both Promise-based and streaming APIs for maximum flexibility.

## 🚀 Quick Start

### Installation

```bash
npm install djelia
```

Or using yarn:

```bash
yarn add djelia
```

### Basic Usage

```javascript
const { Djelia, Language, TranslationRequest } = require('djelia');

// Initialize client
const client = new Djelia('your-api-key');

// Translate text
const request = new TranslationRequest(
    'Hello, how are you?',
    Language.ENGLISH,
    Language.BAMBARA
);

const response = await client.translation.translate(request);
console.log(response.text); // Bambara translation
```

## 📖 Table of Contents

1. [Installation](#installation)
2. [Authentication](#authentication)
3. [Translation](#translation)
4. [Transcription](#transcription)
5. [Text-to-Speech (TTS)](#text-to-speech-tts)
6. [Streaming](#streaming)
7. [Error Handling](#error-handling)
8. [Examples](#examples)
9. [API Reference](#api-reference)

## 🔐 Authentication

### Environment Variables

Create a `.env` file in your project root:

```bash
DJELIA_API_KEY=your_api_key_here
TEST_AUDIO_FILE=path/to/your/audio.wav  # Optional for testing
```

### Direct API Key

```javascript
const { Djelia } = require('djelia');

// With API key parameter
const client = new Djelia('your-api-key');

// Or using environment variable
const client = new Djelia(); // Reads from DJELIA_API_KEY
```

## 🌍 Translation

### Get Supported Languages

```javascript
const languages = await client.translation.getSupportedLanguages();
languages.forEach(lang => {
    console.log(`${lang.name}: ${lang.code}`);
});
```

### Translate Text

```javascript
const { TranslationRequest, Language, Versions } = require('djelia');

const request = new TranslationRequest(
    'Bonjour, comment allez-vous?',
    Language.FRENCH,
    Language.BAMBARA
);

const response = await client.translation.translate(request, Versions.v1);
console.log(`Translation: ${response.text}`);
```

## 🎤 Transcription

### Basic Transcription

```javascript
const { Versions } = require('djelia');

// From file path
const transcription = await client.transcription.transcribe(
    'audio.wav',
    false,    // translateToFrench
    false,    // stream
    Versions.v2
);

transcription.forEach(segment => {
    console.log(`[${segment.start}s - ${segment.end}s]: ${segment.text}`);
});
```

### French Translation

```javascript
const frenchResult = await client.transcription.transcribe(
    'audio.wav',
    true,     // translateToFrench
    false,    // stream
    Versions.v2
);

console.log(`French: ${frenchResult.text}`);
```

### Streaming Transcription

```javascript
const stream = await client.transcription.transcribe(
    'audio.wav',
    false,    // translateToFrench
    true,     // stream
    Versions.v2
);

for await (const segment of stream) {
    console.log(`Real-time: [${segment.start}s]: ${segment.text}`);
}
```

## 🔊 Text-to-Speech (TTS)

### TTS v1 (Speaker IDs)

```javascript
const { TTSRequest, Versions } = require('djelia');

const request = new TTSRequest(
    'Aw ni ce, i ka kɛnɛ wa?',  // Bambara text
    1  // Speaker ID (0-4)
);

const audioFile = await client.tts.textToSpeech(
    request,
    'output.wav',
    false,      // stream
    Versions.v1
);

console.log(`Audio saved to: ${audioFile}`);
```

### TTS v2 (Natural Descriptions)

```javascript
const { TTSRequestV2, Versions } = require('djelia');

const request = new TTSRequestV2(
    'Aw ni ce, i ka kɛnɛ wa?',
    'Seydou speaks with a warm, welcoming tone',  // Must include Moussa, Sekou, or Seydou
    1.0  // Chunk size (0.1 - 2.0)
);

const audioFile = await client.tts.textToSpeech(
    request,
    'natural_output.wav',
    false,      // stream
    Versions.v2
);
```

### Streaming TTS

```javascript
const streamRequest = new TTSRequestV2(
    'Long text for streaming...',
    'Moussa speaks clearly and naturally'
);

const stream = await client.tts.textToSpeech(
    streamRequest,
    'streamed_output.wav',
    true,       // stream
    Versions.v2
);

for await (const chunk of stream) {
    console.log(`Received chunk: ${chunk.length} bytes`);
}
```

## 🌊 Streaming

All streaming operations return async generators:

```javascript
// Transcription streaming
const transcriptionStream = await client.transcription.transcribe(
    'audio.wav', false, true, Versions.v2
);

for await (const segment of transcriptionStream) {
    // Process each segment as it arrives
    console.log(segment.text);
}

// TTS streaming
const ttsStream = await client.tts.textToSpeech(
    request, 'output.wav', true, Versions.v2
);

for await (const audioChunk of ttsStream) {
    // Process each audio chunk
    console.log(`Chunk size: ${audioChunk.length}`);
}
```

## ⚠️ Error Handling

The SDK provides specific exception classes:

```javascript
const {
    AuthenticationError,
    APIError,
    ValidationError,
    LanguageError,
    SpeakerError
} = require('djelia');

try {
    const response = await client.translation.translate(request);
} catch (error) {
    if (error instanceof AuthenticationError) {
        console.error('Invalid API key');
    } else if (error instanceof LanguageError) {
        console.error('Unsupported language');
    } else if (error instanceof SpeakerError) {
        console.error('Invalid speaker configuration');
    } else if (error instanceof APIError) {
        console.error(`API Error (${error.statusCode}): ${error.message}`);
    } else {
        console.error('Unexpected error:', error.message);
    }
}
```

## 🎯 Examples

### Complete Translation Workflow

```javascript
const { Djelia, TranslationRequest, Language, Versions } = require('djelia');

async function translateWorkflow() {
    const client = new Djelia();
    
    // Get available languages
    const languages = await client.translation.getSupportedLanguages();
    console.log('Available languages:', languages.map(l => l.name));
    
    // Translate multiple texts
    const texts = [
        'Hello, how are you?',
        'Good morning',
        'Thank you very much'
    ];
    
    for (const text of texts) {
        const request = new TranslationRequest(text, Language.ENGLISH, Language.BAMBARA);
        const response = await client.translation.translate(request, Versions.v1);
        console.log(`"${text}" → "${response.text}"`);
    }
}
```

### Audio Processing Pipeline

```javascript
async function audioProcessingPipeline(audioFile) {
    const client = new Djelia();
    
    // 1. Transcribe audio
    console.log('Transcribing audio...');
    const segments = await client.transcription.transcribe(audioFile);
    
    // 2. Extract full text
    const fullText = segments.map(s => s.text).join(' ');
    console.log('Transcribed text:', fullText);
    
    // 3. Translate to French
    const translationRequest = new TranslationRequest(
        fullText, 
        Language.BAMBARA, 
        Language.FRENCH
    );
    const translation = await client.translation.translate(translationRequest);
    console.log('French translation:', translation.text);
    
    // 4. Generate speech from translation
    const ttsRequest = new TTSRequestV2(
        translation.text,
        'Sekou speaks with natural pronunciation'
    );
    const audioOutput = await client.tts.textToSpeech(
        ttsRequest, 
        'french_output.wav'
    );
    console.log('Generated audio:', audioOutput);
}
```

### Parallel Operations

```javascript
async function parallelProcessing() {
    const client = new Djelia();
    
    const operations = [
        client.translation.getSupportedLanguages(),
        client.translation.translate(
            new TranslationRequest('Hello', Language.ENGLISH, Language.BAMBARA)
        ),
        client.transcription.transcribe('audio.wav'),
        client.tts.textToSpeech(
            new TTSRequestV2('Test', 'Moussa speaks clearly'),
            'test.wav'
        )
    ];
    
    const results = await Promise.allSettled(operations);
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            console.log(`Operation ${index + 1}: Success`);
        } else {
            console.log(`Operation ${index + 1}: Failed - ${result.reason.message}`);
        }
    });
}
```

## 📚 API Reference

### Classes

- **`Djelia(apiKey?, baseUrl?)`** - Main client class
- **`TranslationRequest(text, source, target)`** - Translation request
- **`TTSRequest(text, speaker)`** - TTS v1 request with speaker ID
- **`TTSRequestV2(text, description, chunkSize?)`** - TTS v2 request with natural description

### Enums

- **`Language`** - Supported languages (FRENCH, ENGLISH, BAMBARA)
- **`Versions`** - API versions (v1, v2)

### Services

- **`client.translation`** - Translation operations
- **`client.transcription`** - Audio transcription
- **`client.tts`** - Text-to-speech generation

### Methods

#### Translation
- `getSupportedLanguages()` → `Promise<SupportedLanguageSchema[]>`
- `translate(request, version?)` → `Promise<TranslationResponse>`

#### Transcription
- `transcribe(audioFile, translateToFrench?, stream?, version?)` → `Promise<TranscriptionSegment[]|FrenchTranscriptionResponse|AsyncGenerator>`

#### TTS
- `textToSpeech(request, outputFile?, stream?, version?)` → `Promise<string|Buffer|AsyncGenerator>`

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Clone the repository
git clone https://github.com/djelia-org/djelia-javascript-sdk.git
cd djelia-javascript-sdk

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API key and audio file path

# Run the cookbook example
npm run example
```

## 📁 Project Structure

```
djelia-javascript-sdk/
├── index.js                 # Main entry point
├── src/
│   ├── client/
│   │   └── client.js        # Main client implementation
│   ├── models/
│   │   └── models.js        # Data models and enums
│   ├── services/
│   │   ├── translation.js   # Translation service
│   │   ├── transcription.js # Transcription service
│   │   └── tts.js          # Text-to-speech service
│   ├── auth/
│   │   └── auth.js         # Authentication handling
│   ├── config/
│   │   └── settings.js     # Configuration management
│   └── utils/
│       ├── utils.js        # Utility functions
│       ├── exceptions.js   # Custom exceptions
│       └── errors.js       # Error handling
├── examples/
│   └── cookbook.js         # Comprehensive example
├── tests/                  # Test files
├── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DJELIA_API_KEY` | Your Djelia API key | Yes | - |
| `BASE_URL` | API base URL | No | `https://djelia.cloud` |
| `TEST_AUDIO_FILE` | Path to test audio file | No | `audio.wav` |

### Settings

```javascript
const { Settings } = require('djelia/src/config/settings');

const settings = new Settings();
console.log(settings.baseUrl);           // API base URL
console.log(settings.validSpeakerIds);   // [0, 1, 2, 3, 4]
console.log(settings.validTtsV2Speakers); // ['Moussa', 'Sekou', 'Seydou']
```

## 🎵 Version Management

```javascript
const { Versions } = require('djelia');

console.log(Versions.latest());        // 2
console.log(Versions.allVersions());   // [1, 2]
console.log(Versions.toString(2));     // "v2"

// Use specific versions
await client.translation.translate(request, Versions.v1);
await client.transcription.transcribe(audioFile, false, false, Versions.v2);
```

## 🚨 Common Errors and Solutions

### Authentication Issues

```javascript
// ❌ Invalid API key format
const client = new Djelia('invalid-key');
// Error: API key must be provided via parameter or environment variable

// ✅ Valid UUID format
const client = new Djelia('12345678-1234-1234-1234-123456789abc');
```

### Speaker Configuration

```javascript
// ❌ Invalid speaker ID for TTS v1
const request = new TTSRequest('text', 99);
// Error: Speaker ID must be one of [0, 1, 2, 3, 4], got 99

// ❌ Missing supported speaker in TTS v2 description
const request = new TTSRequestV2('text', 'natural voice');
// Error: Description must contain one of the supported speakers: [Moussa, Sekou, Seydou]

// ✅ Valid configurations
const requestV1 = new TTSRequest('text', 1);
const requestV2 = new TTSRequestV2('text', 'Seydou speaks naturally');
```

### File Handling

```javascript
// ❌ File not found
await client.transcription.transcribe('nonexistent.wav');
// Error: Audio file not found: nonexistent.wav

// ✅ Check file existence
const fs = require('fs');
if (fs.existsSync('audio.wav')) {
    await client.transcription.transcribe('audio.wav');
}
```

## 🔄 Migration from Python SDK

If you're migrating from the Python SDK, here are the key differences:

### Import Statements

```python
# Python
from djelia import Djelia, Language, TranslationRequest

# JavaScript
const { Djelia, Language, TranslationRequest } = require('djelia');
```

### Async/Await

```python
# Python (async)
async with DjeliaAsync() as client:
    result = await client.translation.translate(request)

# JavaScript
const client = new Djelia();
const result = await client.translation.translate(request);
```

### Streaming

```python
# Python
for segment in client.transcription.transcribe(audio_file, stream=True):
    print(segment.text)

# JavaScript
const stream = await client.transcription.transcribe(audioFile, false, true);
for await (const segment of stream) {
    console.log(segment.text);
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [https://djelia.cloud/docs](https://djelia.cloud/docs)
- **Issues**: [GitHub Issues](https://github.com/djelia-org/djelia-javascript-sdk/issues)
- **Email**: [support@djelia.cloud](mailto:support@djelia.cloud)
- **Community**: Tag `@sudoping01` for questions

## 🙏 Acknowledgments

- Built with ❤️ for 🇲🇱 and African language processing
- Powered by advanced AI for multilingual communication
- Thanks to all contributors and the open-source community

---

**Happy coding with Djelia! 🚀** Transform your applications with the power of African language AI.