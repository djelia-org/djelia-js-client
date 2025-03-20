'use strict';


class DjeliaError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DjeliaError';
  }
}


class AuthenticationError extends DjeliaError {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
  }
}


class ValidationError extends DjeliaError {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}


class APIError extends DjeliaError {
  constructor(statusCode, message) {
    super(`API Error (${statusCode}): ${message}`);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.apiMessage = message;
  }
}


class LanguageError extends ValidationError {
  constructor(message) {
    super(message);
    this.name = 'LanguageError';
  }
}


class SpeakerError extends ValidationError {
  constructor(message) {
    super(message);
    this.name = 'SpeakerError';
  }
}


class AudioFormatError extends ValidationError {
  constructor(message) {
    super(message);
    this.name = 'AudioFormatError';
  }
}

module.exports = {
  DjeliaError,
  AuthenticationError,
  ValidationError,
  APIError,
  LanguageError,
  SpeakerError,
  AudioFormatError
};