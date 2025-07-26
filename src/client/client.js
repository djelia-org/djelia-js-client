// src/client/client.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { Auth } = require('../auth/auth');
const { Translation } = require('../services/translation');
const { Transcription } = require('../services/transcription');
const { TTS } = require('../services/tts');
const { Settings } = require('../config/settings');
const { apiException, generalException } = require('../utils/errors');

class Djelia {
    constructor(apiKey = null, baseUrl = null) {
        this.settings = new Settings();
        this.baseUrl = baseUrl || this.settings.baseUrl;
        
        if (!apiKey) {
            apiKey = this.settings.djeliaApiKey;
        }
        
        this.auth = new Auth(apiKey);
        this.translation = new Translation(this);
        this.transcription = new Transcription(this);
        this.tts = new TTS(this);
        
        // Configure axios instance with retry logic
        this.axios = axios.create({
            timeout: 30000,
            headers: this.auth.getHeaders()
        });
        
        this._setupRetry();
    }
    
    _setupRetry() {
        // Simple retry logic - can be enhanced with exponential backoff
        this.axios.interceptors.response.use(
            response => response,
            async error => {
                const config = error.config;
                
                if (!config || !config.retry) {
                    config.retry = 0;
                }
                
                if (config.retry < 3 && this._shouldRetry(error)) {
                    config.retry += 1;
                    const delay = Math.min(1000 * Math.pow(2, config.retry), 10000);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return this.axios.request(config);
                }
                
                return Promise.reject(error);
            }
        );
    }
    
    _shouldRetry(error) {
        return error.code === 'ECONNRESET' || 
               error.code === 'ETIMEDOUT' ||
               (error.response && error.response.status >= 500);
    }
    
    async _makeRequest(method, endpoint, options = {}) {
        try {
            const config = {
                method,
                url: endpoint,
                headers: this.auth.getHeaders(),
                ...options
            };
            
            // Convert boolean params to lowercase strings
            if (config.params) {
                Object.keys(config.params).forEach(key => {
                    if (typeof config.params[key] === 'boolean') {
                        config.params[key] = config.params[key].toString().toLowerCase();
                    }
                });
            }
            
            const response = await this.axios.request(config);
            return response;
        } catch (error) {
            if (error.response) {
                throw apiException(error.response.status, error);
            }
            throw generalException(error);
        }
    }
    
    async _makeStreamingRequest(method, endpoint, options = {}) {
        try {
            const config = {
                method,
                url: endpoint,
                headers: this.auth.getHeaders(),
                responseType: 'stream',
                ...options
            };
            
            // Convert boolean params to lowercase strings
            if (config.params) {
                Object.keys(config.params).forEach(key => {
                    if (typeof config.params[key] === 'boolean') {
                        config.params[key] = config.params[key].toString().toLowerCase();
                    }
                });
            }
            
            const response = await this.axios.request(config);
            return response;
        } catch (error) {
            if (error.response) {
                throw apiException(error.response.status, error);
            }
            throw generalException(error);
        }
    }
}

module.exports = { Djelia };