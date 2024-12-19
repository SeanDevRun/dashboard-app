const AutoLaunch = require('auto-launch');
const app = require('electron').app;

// Create an AutoLaunch instance
const autoLauncher = new AutoLaunch({
  name: 'Dashboard', // Name of your app
  path: app.getPath('exe'), // Path to the Electron app's main executable
});

// Function to enable auto-launch
function enableAutoLaunch() {
  return autoLauncher.enable()
    .then(() => {
      console.log('App will launch on login');
    })
    .catch((err) => {
      console.error('Error enabling auto-launch:', err);
    });
}

// Function to disable auto-launch
function disableAutoLaunch() {
  return autoLauncher.disable()
    .then(() => {
      console.log('App will no longer launch on login');
    })
    .catch((err) => {
      console.error('Error disabling auto-launch:', err);
    });
}

// Function to check if auto-launch is enabled
function isAutoLaunchEnabled() {
  return autoLauncher.isEnabled();
}

module.exports = {
  enableAutoLaunch,
  disableAutoLaunch,
  isAutoLaunchEnabled,
};
