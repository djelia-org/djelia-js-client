require('dotenv').config({ path: '.env' });
require('dotenv').config(); 


jest.setTimeout(30000);

const originalConsole = global.console;


if (process.env.CI || process.env.SUPPRESS_LOGS) {
    global.console = {
        ...console,
        log: jest.fn(),
        info: jest.fn(),
        warn: originalConsole.warn, // Keep warnings
        error: originalConsole.error, // Keep errors
    };
}


global.testUtils = {
    shouldRunAPITests: () => {
        if (!process.env.DJELIA_API_KEY) {
            console.warn('Skipping API tests - DJELIA_API_KEY not provided');
            return false;
        }
        return true;
    },
    
    generateTestFilename: (prefix = 'test', extension = '.wav') => {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${extension}`;
    },
    

    cleanupTestFiles: (pattern = /^test_.*\.wav$/) => {
        const fs = require('fs');
        try {
            const files = fs.readdirSync('.');
            files.filter(file => pattern.test(file)).forEach(file => {
                try {
                    fs.unlinkSync(file);
                } catch (e) {
 
                }
            });
        } catch (e) {
          
        }
    }
};

global.testUtils.cleanupTestFiles();