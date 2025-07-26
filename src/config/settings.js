require('dotenv').config();

class Settings {
    constructor() {
        this.baseUrl = process.env.BASE_URL || 'https://djelia.cloud';
        this.djeliaApiKey = process.env.DJELIA_API_KEY;
        this.validSpeakerIds = [0, 1, 2, 3, 4];
        this.validTtsV2Speakers = ['Moussa', 'Sekou', 'Seydou'];
        this.defaultSpeakerId = 1;
    }
}

module.exports = { Settings };