const { app } = require('electron');
const fs = require('fs');
const path = require('path');

/**
 * Load the configuration from the config.json file.
 * @returns {Object} The parsed configuration object.
 */
function loadConfig() {

    // Get the path to user data directory
    const configPath = path.join(app.getAppPath(), 'configs', 'viewsConfig.json');

    try {
        console.log(`Config: ${configPath}`)
        const data = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(data);
        return config;
    } catch (err) {
        console.error('Error reading config file:', err);
        return null; // Or return default configuration if needed
    }
}

module.exports = { loadConfig };
