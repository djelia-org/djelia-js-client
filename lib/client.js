'use strict';

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { Readable } = require('stream');
const { djeliaConfig } = require('./constants');
const {
  DjeliaError,
  AuthenticationError,
  ValidationError,
  APIError,
  LanguageError,
  SpeakerError,
  AudioFormatError
} = require('./exceptions');


class Djelia {
  /**
   * Create a new Djelia client
   * @param {string} apiKey - Djelia API key (optional if DJELIA_API_KEY env var is set)
   */
  constructor(apiKey) {
    this.apiKey = apiKey || process.env[djeliaConfig.ENV_API_KEY];
    if (!this.apiKey) {
      throw new AuthenticationError(
        `API key is required. Provide it as an argument or set the ${djeliaConfig.ENV_API_KEY} environment variable.`
      );
    }

    this.headers = {
      [djeliaConfig.API_KEY_HEADER]: this.apiKey
    };

    this.axiosInstance = axios.create({
      baseURL: djeliaConfig.BASE_URL,
      headers: this.headers
    });
  }

  /**
   * Handle error responses from the API
   * @private
   * @param {Error} error - Axios error object
   * @throws {AuthenticationError|ValidationError|APIError} Appropriate error based on response
   */
  _handleResponseError(error) {
    if (!error.response) {
      throw new APIError(500, error.message || 'Network error');
    }

    const { status, data } = error.response;

    if (status === 401) {
      throw new AuthenticationError('Invalid API key or unauthorized access');
    } else if (status === 422) {
      const errorDetail = data?.detail || 'Validation failed';
      throw new ValidationError(`Validation error: ${errorDetail}`);
    } else {
      const errorMsg = data?.detail || error.response.statusText || 'Unknown error';
      throw new APIError(status, errorMsg);
    }
  }

  /**
   * Get list of supported languages
   * @param {number} version - API version to use (default: 1)
   * @returns {Promise<Array>} List of supported languages
   * @throws {ValidationError} If version is not supported
   * @throws {APIError} If API request fails
   */
  async getSupportedLanguages(version = 1) {
    if (!djeliaConfig.MODELS_VERSION.supported_languages.includes(version)) {
      throw new ValidationError(`Version must be one of ${djeliaConfig.MODELS_VERSION.supported_languages}`);
    }

    try {
      const url = djeliaConfig.ENDPOINTS.supported_languages[version];
      const response = await this.axiosInstance.get(url);
      return response.data;
    } catch (error) {
      this._handleResponseError(error);
    }
  }

  /**
   * Translate text between supported languages
   * @param {string} text - Text to translate
   * @param {string} source - Source language code
   * @param {string} target - Target language code
   * @param {number} version - API version to use (default: 1)
   * @returns {Promise<Object>} Translation result
   * @throws {ValidationError} If version is not supported
   * @throws {LanguageError} If source or target language is not supported
   * @throws {APIError} If API request fails
   */
  async translate(text, source, target, version = 1) {
    if (!djeliaConfig.MODELS_VERSION.translate.includes(version)) {
      throw new ValidationError(`Version must be one of ${djeliaConfig.MODELS_VERSION.translate}`);
    }

    if (!Object.keys(djeliaConfig.SUPPORTED_LANGUAGES).includes(source)) {
      throw new LanguageError(
        `Source language '${source}' not supported. Must be one of ${Object.keys(djeliaConfig.SUPPORTED_LANGUAGES)}`
      );
    }

    if (!Object.keys(djeliaConfig.SUPPORTED_LANGUAGES).includes(target)) {
      throw new LanguageError(
        `Target language '${target}' not supported. Must be one of ${Object.keys(djeliaConfig.SUPPORTED_LANGUAGES)}`
      );
    }

    try {
      const url = djeliaConfig.ENDPOINTS.translate[version];
      const data = {
        text,
        source: djeliaConfig.SUPPORTED_LANGUAGES[source],
        target: djeliaConfig.SUPPORTED_LANGUAGES[target]
      };

      const response = await this.axiosInstance.post(url, data, {
        headers: { 'Content-Type': 'application/json' }
      });

      return response.data;
    } catch (error) {
      this._handleResponseError(error);
    }
  }

  /**
   * Transcribe audio file to text
   * @param {string|Buffer|stream.Readable} audioFile - Audio file path, buffer, or readable stream
   * @param {boolean} translateToFrench - Whether to translate the result to French (default: false)
   * @param {number} version - API version to use (default: 2)
   * @returns {Promise<Object|Array>} Transcription result
   * @throws {ValidationError} If version is not supported
   * @throws {APIError} If API request fails
   */
  async transcribe(audioFile, translateToFrench = false, version = 2) {
    if (!djeliaConfig.MODELS_VERSION.transcription.includes(version)) {
      throw new ValidationError(`Version must be one of ${djeliaConfig.MODELS_VERSION.transcription}`);
    }

    const url = djeliaConfig.ENDPOINTS.transcribe[version];
    const params = { translate_to_french: translateToFrench };
    const formData = new FormData();

    try {
      if (typeof audioFile === 'string') {
        const fileName = path.basename(audioFile);
        const fileStream = fs.createReadStream(audioFile);
        formData.append('file', fileStream, fileName);
      } else if (Buffer.isBuffer(audioFile)) {
        formData.append('file', Buffer.from(audioFile), 'audio_file');
      } else if (audioFile instanceof Readable) {
        formData.append('file', audioFile, 'audio_file');
      } else {
        throw new ValidationError('Audio file must be a file path, buffer, or readable stream');
      }

      const response = await this.axiosInstance.post(url, formData, {
        params,
        headers: {
          ...formData.getHeaders()
        }
      });

      return response.data;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      this._handleResponseError(error);
    }
  }

  /**
   * Stream transcription results from an audio file
   * @param {string|Buffer|stream.Readable} audioFile - Audio file path, buffer, or readable stream
   * @param {boolean} translateToFrench - Whether to translate the result to French (default: false)
   * @param {number} version - API version to use (default: 1)
   * @returns {AsyncGenerator<Object>} Generator that yields transcription segments
   * @throws {ValidationError} If version is not supported
   * @throws {APIError} If API request fails
   */
  async *streamTranscribe(audioFile, translateToFrench = false, version = 1) {
    if (!djeliaConfig.MODELS_VERSION.transcribe_stream.includes(version)) {
      throw new ValidationError(`Version must be one of ${djeliaConfig.MODELS_VERSION.transcribe_stream}`);
    }

    const url = djeliaConfig.ENDPOINTS.transcribe_stream[version];
    const params = { translate_to_french: translateToFrench };
    const formData = new FormData();

    try {
      if (typeof audioFile === 'string') {
        const fileName = path.basename(audioFile);
        const fileStream = fs.createReadStream(audioFile);
        formData.append('file', fileStream, fileName);
      } else if (Buffer.isBuffer(audioFile)) {
        formData.append('file', Buffer.from(audioFile), 'audio_file');
      } else if (audioFile instanceof Readable) {
        formData.append('file', audioFile, 'audio_file');
      } else {
        throw new ValidationError('Audio file must be a file path, buffer, or readable stream');
      }

      const response = await this.axiosInstance.post(url, formData, {
        params,
        headers: {
          ...formData.getHeaders()
        },
        responseType: 'stream'
      });

      const stream = response.data;
      let buffer = '';

      for await (const chunk of stream) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep the last (potentially incomplete) line

        for (const line of lines) {
          if (line.trim()) {
            try {
              yield JSON.parse(line);
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Process any remaining data
      if (buffer.trim()) {
        try {
          yield JSON.parse(buffer);
        } catch (e) {
          // Skip invalid JSON
        }
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      this._handleResponseError(error);
    }
  }

  /**
   * Convert text to speech
   * @param {string} text - Text to convert to speech
   * @param {number} speaker - Speaker ID (default: djeliaConfig.DEFAULT_SPEAKER_ID)
   * @param {string} outputFile - Path to save the audio file (optional)
   * @param {number} version - API version to use (default: 1)
   * @returns {Promise<Buffer|string>} Audio data buffer or file path if outputFile is provided
   * @throws {ValidationError} If version is not supported or speaker ID is invalid
   * @throws {APIError} If API request fails
   */
  async textToSpeech(text, speaker = djeliaConfig.DEFAULT_SPEAKER_ID, outputFile = null, version = 1) {
    if (!djeliaConfig.MODELS_VERSION.text_to_speech.includes(version)) {
      throw new ValidationError(`Version must be one of ${djeliaConfig.MODELS_VERSION.text_to_speech}`);
    }

    if (!djeliaConfig.VALID_SPEAKER_IDS.includes(speaker)) {
      throw new SpeakerError(`Speaker ID must be one of ${djeliaConfig.VALID_SPEAKER_IDS}, got ${speaker}`);
    }

    try {
      const url = djeliaConfig.ENDPOINTS.text_to_speech[version];
      const data = {
        text,
        speaker
      };

      const response = await this.axiosInstance.post(url, data, {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'arraybuffer'
      });

      const audioBuffer = Buffer.from(response.data);

      if (outputFile) {
        try {
          fs.writeFileSync(outputFile, audioBuffer);
          return outputFile;
        } catch (error) {
          throw new Error(`Failed to save audio file: ${error.message}`);
        }
      } else {
        return audioBuffer;
      }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof SpeakerError || error instanceof Error) {
        throw error;
      }
      this._handleResponseError(error);
    }
  }
}

/**
 * Async Djelia client for Promise-based operations
 * Note: In JavaScript/Node.js, all HTTP requests are already asynchronous,
 * so this class is mainly provided for API consistency with the Python version.
 * The methods have the same functionality as the sync client.
 */
class AsyncDjelia extends Djelia {
  /**
   * Create a new AsyncDjelia client
   * @param {string} apiKey - Djelia API key (optional if DJELIA_API_KEY env var is set)
   */
  constructor(apiKey) {
    super(apiKey);
  }

  /**
   * All methods are inherited from the Djelia class,
   * as Node.js HTTP requests are already asynchronous.
   */
}

module.exports = { Djelia, AsyncDjelia };