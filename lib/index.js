'use strict';

const client = require('./client');
const constants = require('./constants');
const exceptions = require('./exceptions');

module.exports = {
  Djelia: client.Djelia,
  SUPPORTED_LANGUAGES: constants.SUPPORTED_LANGUAGES,
  VALID_SPEAKER_IDS: constants.VALID_SPEAKER_IDS,

  DjeliaError: exceptions.DjeliaError,
  AuthenticationError: exceptions.AuthenticationError,
  ValidationError: exceptions.ValidationError,
  APIError: exceptions.APIError,
  LanguageError: exceptions.LanguageError,
  SpeakerError: exceptions.SpeakerError,
  AudioFormatError: exceptions.AudioFormatError
};