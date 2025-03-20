# Djelia JavaScript Client

JavaScript client for the Djelia API, providing language services for Bambara.

## Installation

```bash
npm install git+https://github.com/djelia-org/djelia-js-client
```

## Quick Start

### Authentication

```javascript
const { Djelia } = require('djelia');

// Using API key directly
const client = new Djelia('your_api_key');

// Or use environment variable
// export DJELIA_API_KEY=your_api_key
const client = new Djelia();
```

### Translation

Translate text between supported languages:

```javascript
async function translate() {
  try {
    const result = await client.translate(
      'Hello, how are you?', 
      'en',  // English
      'bam'  // Bambara
    );
    console.log(result.text);
  } catch (error) {
    console.error('Translation error:', error.message);
  }
}
```

### Transcription

Convert speech to text from audio files:

```javascript
// Basic transcription
async function transcribe() {
  try {
    // Using a file path
    const result = await client.transcribe('audio_file.mp3');
    
    // With timestamps (version 2)
    const resultWithTimestamps = await client.transcribe('audio_file.mp3', false, 2);
    for (const segment of resultWithTimestamps) {
      console.log(segment.text);
    }
    
    // With French translation
    const translatedResult = await client.transcribe('audio_file.mp3', true);
    
    // Using a buffer
    const audioBuffer = fs.readFileSync('audio_file.mp3');
    const bufferResult = await client.transcribe(audioBuffer);
    
    // Using a stream
    const stream = fs.createReadStream('audio_file.mp3');
    const streamResult = await client.transcribe(stream);
  } catch (error) {
    console.error('Transcription error:', error.message);
  }
}
```

### Streaming Transcription

Process audio in real-time:

```javascript
async function streamTranscribe() {
  try {
    // Using a file path
    for await (const segment of client.streamTranscribe('audio_file.mp3')) {
      console.log(segment.text);
    }
  } catch (error) {
    console.error('Streaming transcription error:', error.message);
  }
}
```

### Text-to-Speech

Convert text to natural-sounding speech:

```javascript
async function textToSpeech() {
  try {
    // Generate audio and save to file
    const filePath = await client.textToSpeech(
      'Text to convert to speech',
      1,  // Choose voice (0-4)
      'output.mp3'
    );
    console.log(`Audio saved to: ${filePath}`);
    
    // Get audio as buffer
    const audioBuffer = await client.textToSpeech('Hello world');
    // Do something with the buffer
    fs.writeFileSync('output.mp3', audioBuffer);
  } catch (error) {
    console.error('Text-to-speech error:', error.message);
  }
}
```

## Parallel Processing

Run multiple operations simultaneously for better performance:

```javascript
const { Djelia } = require('djelia');

async function main() {
  const client = new Djelia('your_api_key');
  
  // Run tasks in parallel
  const [translation, languages, audioPath] = await Promise.all([
    client.translate('Hello', 'en', 'bam'),
    client.getSupportedLanguages(),
    client.textToSpeech('Aw ni ce', 1, 'greeting.mp3')
  ]);
  
  console.log('Translation:', translation);
  console.log('Supported languages:', languages);
  console.log('Audio saved to:', audioPath);
}
```

## Supported Languages

Currently supports:
- English (en)
- French (fr)
- Bambara (bam)

Check available languages:

```javascript
async function getLanguages() {
  const languages = await client.getSupportedLanguages();
  console.log(languages);
}
```

## Error Handling

Handle API errors gracefully:

```javascript
const { Djelia, DjeliaError } = require('djelia');

async function handleErrors() {
  try {
    const client = new Djelia('your_api_key');
    const result = await client.translate('Hello', 'en', 'bam');
    console.log(result.text);
  } catch (error) {
    if (error instanceof DjeliaError) {
      console.error('Djelia API error:', error.message);
      
      // Handle specific error types
      if (error.name === 'AuthenticationError') {
        console.error('Check your API key');
      } else if (error.name === 'ValidationError') {
        console.error('Invalid input parameters');
      } else if (error.name === 'APIError') {
        console.error(`Server returned status ${error.statusCode}`);
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }
}
```

## Support

Need help? Contact: support@djelia.cloud