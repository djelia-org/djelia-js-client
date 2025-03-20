'use strict';

const endpoints = {
  translate: { 1: "/api/v1/models/translate" },
  supported_languages: { 1: "/api/v1/models/translate/supported-languages" },
  transcribe: {
    1: "/api/v1/models/transcribe",
    2: "/api/v2/models/transcribe"
  },
  transcribe_stream: {
    1: "/api/v1/models/transcribe/stream",
    2: "/api/v2/models/transcribe/stream"
  },
  text_to_speech: { 1: "/api/v1/models/tts" }
};

const modelsVersion = {
  transcription: [1, 2],
  translate: [1],
  supported_languages: [1],
  transcribe_stream: [1, 2],
  text_to_speech: [1]
};

const djeliaConfig = {
  BASE_URL: "https://djelia.cloud",
  API_KEY_HEADER: "x-api-key",
  ENV_API_KEY: "DJELIA_API_KEY",
  ENDPOINTS: endpoints,
  SUPPORTED_LANGUAGES: {
    "fr": "fra_Latn",
    "en": "eng_Latn",
    "bam": "bam_Latn"
  },
  VALID_SPEAKER_IDS: [0, 1, 2, 3, 4],
  DEFAULT_SPEAKER_ID: 1,
  MODELS_VERSION: modelsVersion
};

module.exports = {
  djeliaConfig,
  SUPPORTED_LANGUAGES: djeliaConfig.SUPPORTED_LANGUAGES,
  VALID_SPEAKER_IDS: djeliaConfig.VALID_SPEAKER_IDS
};