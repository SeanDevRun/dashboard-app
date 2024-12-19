const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const { resolvePath } = require('./pathHelpers');


const userDataPath = app.getPath('userData');
const userConfigDirPath = path.join(userDataPath, 'Configs');
const userConfigPath = path.join(userConfigDirPath, 'config.json');
const demoConfigPath = path.join(userConfigDirPath, 'demo_config.json');
const bundledConfigPath = path.join(resolvePath('@configs'), 'default.json');

function ensureDirectoryExists(directoryPath) {

  // Check if the directory exists
  if (!fs.existsSync(directoryPath)) {
    try {
      // Create the directory (and any necessary parent directories)
      fs.mkdirSync(directoryPath, { recursive: true });
      console.log(`Directory created: ${directoryPath}`);
    } catch (err) {
      console.error(`Error creating directory: ${err}`);
    }
  }

}

function getConfigDirPath() {

  return userConfigDirPath;

}

/**
 * Ensures that the user-editable config file exists in the userData directory.
 * If it doesn't exist, copy it from the bundled resources.
 */
function getConfigPath() {

  ensureDirectoryExists(userConfigDirPath);

  if (!fs.existsSync(userConfigPath)) {
    if (!fs.existsSync(userConfigPath)) {
      try {
        fs.copyFileSync(bundledConfigPath, userConfigPath);
        console.log(`\nCopied default config to: ${userConfigPath}`);
        fs.copyFileSync(bundledConfigPath, demoConfigPath);
        console.log(`\nCopied default config to: ${demoConfigPath}`);
      } catch (err) {
        console.error('Error copying config file:', err);
      }
    }
    else
    {
      console.error(`Error copying config file as doesn't exist:\n${userConfigPath}`); 
    }
  }

  return userConfigPath;

}

/**
 * Load the configuration file.
 */
function loadConfig() {

  const configPath = getConfigPath();

  console.log(`\nConfig Path: ${configPath}`)

  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (err) {
    console.error('Error reading config file:', err);
    return {};
  }

}

module.exports = { loadConfig, getConfigPath, getConfigDirPath };

