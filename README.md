# <h1 style="color:#00FFFF;"> Djelia JavaScript SDK 🇲🇱

Welcome to the Djelia JavaScript SDK! This powerful library enables seamless integration with Djelia's AI services for African languages, featuring translation, transcription, and text-to-speech capabilities. Built with modern JavaScript/Node.js, it offers both Promise-based and streaming APIs for maximum flexibility. can't be fun, right? Let's dive in!

## <h3 style="color:#00FFFF;"> Table of Contents

1. [Installation](#installation)
2. [Client Initialization](#client-initialization)
   - 2.1 [API Key Loading](#api-key-loading)
   - 2.2 [Client Setup](#client-setup)
3. [Operations](#operations)
   - 3.1 [Translation](#translation)
     - 3.1.1 [Get Supported Languages](#get-supported-languages)
     - 3.1.2 [Translate Text](#translate-text)
   - 3.2 [Transcription](#transcription)
     - 3.2.1 [Basic Transcription](#basic-transcription)
     - 3.2.2 [Streaming Transcription](#streaming-transcription)
     - 3.2.3 [French Translation](#french-translation)
   - 3.3 [Text-to-Speech (TTS)](#text-to-speech-tts)
     - 3.3.1 [TTS v1 with Speaker ID](#tts-v1-with-speaker-id)
     - 3.3.2 [TTS v2 with Natural Descriptions](#tts-v2-with-natural-descriptions)
     - 3.3.3 [Streaming TTS](#streaming-tts)
   - 3.4 [Version Management](#version-management)
   - 3.5 [Parallel Operations](#parallel-operations)
4. [Error Handling](#error-handling)
5. [Explore the Djelia SDK Cookbook](#explore-the-djelia-sdk-cookbook)

## <h3 style="color:#00FFFF;"> Installation

Let's kick things off by installing the SDK

```bash
npm install djelia
```


Or using yarn:

```bash
yarn add djelia
```

Install the Djelia JavaScript SDK directly from GitHub:
```bash
npm install git+https://github.com/djelia-org/djelia-javascript-sdk.git
```

Alternatively, use pnpm for faster dependency resolution:

```bash
pnpm install djelia
```

```bash
pnpm install git+https://github.com/djelia-org/djelia-javascript-sdk.git
```


## <h3 style="color:#00FFFF;"> Client Initialization

Before we can do anything fancy, we need to set up our client. This involves loading our API key and initializing the client. Here's how:

## <h3 style="color:#00FFFF;"> API Key Loading

First, grab your API key from a `.env` file - it's the safest way to keep your secrets, well, secret! If you don't have one yet, head to the Djelia dashboard and conjure one up.

```javascript
require('dotenv').config();

const apiKey = process.env.DJELIA_API_KEY;

// Alternatively: const apiKey = "your_api_key_here" (but shh, that's not safe!)

// Specify your audio file for transcription tests
const audioFilePath = process.env.TEST_AUDIO_FILE || "audio.wav";
```

> <span style="color:red;"> **Note:** </span> Ensure your audio file (e.g., `audio.wav`) exists at the specified path. Set `TEST_AUDIO_FILE` in your `.env` file if using a custom path:
> ```bash
> echo "TEST_AUDIO_FILE=/path/to/your/audio.wav" >> .env
> ```
> Without a valid audio file, transcription operations will fail. That's not what you want right 😂

<h3 style="color:#00FFFF;">Client Setup</h3>

For those who like to keep things simple and powerful, here's how to set up the client:

```javascript
const { Djelia } = require('djelia');

const djeliaClient = new Djelia(apiKey);

// if DJELIA_API_KEY is already set you can just do : (yes I know I'm making your life easy 😂)
const djeliaClient = new Djelia();
```

## <h3 style="color:#00FFFF;"> Operations 🇲🇱

<span style="color:gold;"> Now for the fun part - let's do stuff with the Djelia API! We'll cover translating between African languages, transcribing audio (with streaming!), and generating natural speech with beautiful JavaScript async/await patterns.</span> <span style="color:red;"> Yes, yes, let's do it ❤️‍🔥! 

## <h3 style="color:#00FFFF;"> Translation

Let's unlock the power of multilingual communication! 

## <h3 style="color:#00FFFF;"> Get Supported Languages

First, let's see what languages we can work with.

Simple and straightforward - get your supported languages and print them:

```javascript
const languages = await djeliaClient.translation.getSupportedLanguages();
languages.forEach(lang => {
    console.log(`${lang.name}: ${lang.code}`);
});
```

## <h3 style="color:#00FFFF;"> Translate Text

Let's translate some text between beautiful 🇲🇱 languages and others. Feel free to try different language combinations!

```javascript
const { TranslationRequest, Language, Versions } = require('djelia');

const request = new TranslationRequest(
    "Hello, how are you today?",
    Language.ENGLISH,
    Language.BAMBARA
);
```

Create that translation and see what you get:

```javascript
const { TranslationResponse } = require('djelia');

try {
    const response = await djeliaClient.translation.translate(request, Versions.v1);
    console.log(`Original: ${request.text}`);
    console.log(`Translation: ${response.text}`);
} catch (error) {
    console.log(`Translation error: ${error.message}`);
}
```

## <h3 style="color:#00FFFF;"> Transcription

Time to turn audio into text with timestamps and everything!

## <h3 style="color:#00FFFF;"> Basic Transcription

Let's transcribe some audio files. Make sure you have an audio file ready - check <span style="color:red;"> audioFilePath</span>.

```javascript
const { Versions } = require('djelia');

try {
    const transcription = await djeliaClient.transcription.transcribe(
        audioFilePath,
        false,    // translateToFrench
        false,    // stream
        Versions.v2
    );
    console.log(`Transcribed ${transcription.length} segments:`);
    transcription.forEach(segment => {
        console.log(`[${segment.start.toFixed(2)}s - ${segment.end.toFixed(2)}s]: ${segment.text}`);
    });
} catch (error) {
    console.log(`Transcription error: ${error.message}`);
}
```

## <h3 style="color:#00FFFF;"> Streaming Transcription

Want realtime results? Let's stream that transcription! <span style="color:gold">This is really important for live applications</span>

```javascript
console.log("Streaming transcription (showing first 3 segments)...");
let segmentCount = 0;

try {
    const stream = await djeliaClient.transcription.transcribe(
        audioFilePath,
        false,    // translateToFrench
        true,     // stream
        Versions.v2
    );
    
    for await (const segment of stream) {
        segmentCount++;
        console.log(`Segment ${segmentCount}: [${segment.start.toFixed(2)}s]: ${segment.text}`);
        
        if (segmentCount >= 3) {  // Just showing first 3 for demo
            console.log("...and more segments!");
            break;
        }
    }
} catch (error) {
    console.log(`Streaming transcription error: ${error.message}`);
}
```

## <h3 style="color:#00FFFF;"> French Translation

Want to transcribe and translate to French in one go? We've got you covered!

```javascript
try {
    const frenchTranscription = await djeliaClient.transcription.transcribe(
        audioFilePath,
        true,     // translateToFrench
        false,    // stream
        Versions.v2
    );
    console.log(`French translation: ${frenchTranscription.text}`);
} catch (error) {
    console.log(`French transcription error: ${error.message}`);
}
```

## <h3 style="color:#00FFFF;"> Text-to-Speech (TTS)

Let's make some beautiful voices! Choose between numbered speakers or describe exactly how you want it to sound.

## <h3 style="color:#00FFFF;"> TTS v1 with Speaker ID

Classic approach with speaker IDs (0-4). Simple and effective!

```javascript
const { TTSRequest } = require('djelia');

const ttsRequestV1 = new TTSRequest(
    "Aw ni ce, i ka kɛnɛ wa?",  // "Hello, how are you?" in Bambara
    1  // Choose from 0, 1, 2, 3, or 4
);
```

Generate that audio and save it:

```javascript
try {
    const audioFileV1 = await djeliaClient.tts.textToSpeech(
        ttsRequestV1,
        "hello_v1.wav",
        false,      // stream
        Versions.v1
    );
    console.log(`Audio saved to: ${audioFileV1}`);
} catch (error) {
    console.log(`TTS v1 error: ${error.message}`);
}
```

## <h3 style="color:#00FFFF;"> TTS v2 with Natural Descriptions

This is where it gets fun! Describe exactly how you want the voice to sound, but make sure to include one of the supported speakers: Moussa, Sekou, or Seydou.

```javascript
const { TTSRequestV2 } = require('djelia');

const ttsRequestV2 = new TTSRequestV2(
    "Aw ni ce, i ka kɛnɛ wa?",
    "Seydou speaks with a warm, welcoming tone",  // Must include Moussa, Sekou, or Seydou
    1.0  // Control speech pacing (0.1 - 2.0)
);
```

> <span style="color:red"> **Note:** </span> The description field must include one of the supported speakers. For example, "Moussa speaks with a warm tone" is valid, but "Natural tone" will raise an error. 

Create natural sounding speech:

```javascript
try {
    const audioFileV2 = await djeliaClient.tts.textToSpeech(
        ttsRequestV2,
        "hello_v2.wav",
        false,      // stream
        Versions.v2
    );
    console.log(`Natural audio saved to: ${audioFileV2}`);
} catch (error) {
    console.log(`TTS v2 error: ${error.message}`);
}
```

## <h3 style="color:#00FFFF;"> Streaming TTS

Realtime audio generation! Get chunks as they're created <span style="color:red">(v2 only)</span>.

```javascript
const streamingTtsRequest = new TTSRequestV2(
    "An filɛ ni ye yɔrɔ minna ni an ye an sigi ka a layɛ yala an bɛ ka baara min kɛ ɛsike a kɛlen don ka Ɲɛ wa, ...............", // a very long text 
    "Seydou speaks clearly and naturally",
    1.0
);
```

> <span style="color:red">**Note:**</span> By default, the SDK may process multiple chunks (e.g., up to 5 in some configurations). This example limits to 5 chunks for consistency, but you can adjust the limit based on your application needs.

Stream that audio generation: (this is handsome)

```javascript
console.log("Streaming TTS generation...");
let chunkCount = 0;
let totalBytes = 0;
const maxChunks = 5;

try {
    const stream = await djeliaClient.tts.textToSpeech(
        streamingTtsRequest,
        "streamed_audio.wav",
        true,       // stream
        Versions.v2
    );
    
    for await (const chunk of stream) {
        chunkCount++;
        totalBytes += chunk.length;
        console.log(`Chunk ${chunkCount}: ${chunk.length} bytes`);
        
        if (chunkCount >= maxChunks) {
            console.log(`...and more chunks! (Total so far: ${totalBytes} bytes)`);
            break;
        }
    }
} catch (error) {
    console.log(`Streaming TTS error: ${error.message}`);
}
```

## <h3 style="color:#00FFFF;"> Version Management

The SDK supports multiple API versions (v1, v2) via the Versions enum. Use `Versions.latest()` to get the latest version or `Versions.allVersions()` to list available versions.

```javascript
const { Versions } = require('djelia');

console.log(`Latest version: ${Versions.latest()}`);
console.log(`Available versions: ${Versions.allVersions().map(v => `v${v}`)}`);

// Use specific version
try {
    const transcription = await djeliaClient.transcription.transcribe(
        audioFilePath,
        false,    // translateToFrench
        false,    // stream
        Versions.v2
    );
    console.log(`Transcribed ${transcription.length} segments`);
} catch (error) {
    console.log(`Transcription error: ${error.message}`);
}
```

## <h3 style="color:#00FFFF;"> Parallel Operations

Run multiple API operations concurrently using `Promise.allSettled()`. This is great for performance in applications needing simultaneous translations, transcriptions, or TTS generation.

```javascript
const { TranslationRequest, Language, TTSRequestV2, Versions } = require('djelia');

async function parallelOperations() {
    try {
        const translationRequest = new TranslationRequest(
            "Hello", 
            Language.ENGLISH, 
            Language.BAMBARA
        );
        const ttsRequest = new TTSRequestV2(
            "Aw ni ce, i ka kɛnɛ wa?",
            "Moussa speaks with a clear tone",
            1.0
        );
        
        const results = await Promise.allSettled([
            djeliaClient.translation.translate(translationRequest, Versions.v1),
            djeliaClient.transcription.transcribe(audioFilePath, false, false, Versions.v2),
            djeliaClient.tts.textToSpeech(ttsRequest, "parallel_tts.wav", false, Versions.v2)
        ]);
        
        results.forEach((result, i) => {
            if (result.status === 'fulfilled') {
                console.log(`Operation ${i+1} succeeded: ${result.value.constructor.name}`);
            } else {
                console.log(`Operation ${i+1} failed: ${result.reason.message}`);
            }
        });
    } catch (error) {
        console.log(`Parallel operations error: ${error.message}`);
    }
}

// Run it
parallelOperations();
```

## <h3 style="color:#00FFFF;"> Error Handling

The Djelia SDK provides specific exception classes to handle errors gracefully. Use these to catch and respond to issues like invalid API keys, unsupported languages, or incorrect speaker descriptions.

```javascript
const { 
    AuthenticationError, 
    APIError, 
    ValidationError, 
    LanguageError, 
    SpeakerError 
} = require('djelia');

try {
    const response = await djeliaClient.translation.translate(request, Versions.v1);
    console.log(`Translation: ${response.text}`);
} catch (error) {
    if (error instanceof AuthenticationError) {
        console.error('Authentication error (check API key):', error.message);
    } else if (error instanceof LanguageError) {
        console.error('Invalid or unsupported language:', error.message);
    } else if (error instanceof ValidationError) {
        console.error('Validation error (e.g., invalid input):', error.message);
    } else if (error instanceof APIError) {
        console.error(`API error (status ${error.statusCode}): ${error.message}`);
    } else {
        console.error('Unexpected error:', error.message);
    }
}
```

## <h3 style="color:#00FFFF;"> Common Exceptions:

- **AuthenticationError**: Invalid or expired API key (HTTP 401).
- **APIError**: General API issues, including forbidden access (403) or resource not found (404).
- **ValidationError**: Invalid inputs, such as missing audio files or incorrect parameters (422).
- **LanguageError**: Unsupported source or target language.
- **SpeakerError**: Invalid speaker ID (TTS v1) or description missing a supported speaker (TTS v2).

Check logs for detailed errors, and ensure your `.env` file includes a valid `DJELIA_API_KEY` and `TEST_AUDIO_FILE`.

## <h3 style="color:#00FFFF;"> Explore the Djelia SDK Cookbook

Want to take your Djelia SDK skills to the next level? Check out the **Djelia SDK Cookbook** for a comprehensive example that puts it all together! The cookbook demonstrates:

- **Full Test Suite**: Run comprehensive tests for translation, transcription, and TTS, with detailed summaries.
- **Error Handling**: Robust try-catch blocks and logging to catch and debug issues.
- **Configuration Management**: Load API keys and audio paths from a `.env` file with validation.
- **Advanced Features**: Parallel API operations, version management, and streaming capabilities.
- **Modular Design**: Organized code structure for easy customization.

To run the cookbook, clone the repository, install dependencies, and execute:

```bash
git clone https://github.com/djelia-org/djelia-javascript-sdk.git
npm install

cd djelia-javascript-sdk
npm run example
```

Or run it directly:

```bash
node examples/cookbook.js
```

Make sure your `.env` file includes `DJELIA_API_KEY` and `TEST_AUDIO_FILE`. The cookbook is perfect for developers who want a ready-to-use template for building real-world applications with the Djelia SDK.

## <h3 style="color:#00FFFF;"> Wrapping Up

And there you have it - a full workshop on using the Djelia JavaScript SDK! You've installed it, set up the client, and mastered translation, transcription, and text-to-speech with beautiful async/await patterns. Pretty cool, right? Feel free to tweak the code, explore different languages and voices, and check out the Djelia SDK Cookbook for a deeper dive.

**Pro tip**: The async/await patterns are perfect for applications that need to handle multiple operations efficiently. The streaming features are fantastic for realtime applications. And remember, Bambara is just one of the beautiful African languages you can work with!

<span style="color:red"><strong>IMPORTANT</strong></span>: If you encounter any issues, please create an issue in the repository, explain the problem you encountered (include logs if possible), and tag @sudoping01.

**Great job, bro 🫂! This is a fantastic integration guide built with ❤️ for 🇲🇱 and beyond!**<br>
