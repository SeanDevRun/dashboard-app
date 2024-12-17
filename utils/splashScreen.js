const { BrowserWindow } = require('electron');
const path = require('path');

const { resolvePath } = require('./pathHelpers');

function createSplashScreen() {
    let splashWindow = new BrowserWindow({        
        width: 700, // Set the width of the splash screen
        height: 500, // Set the height of the splash screen
        frame: false, // Remove window frame
        transparent: true, // Optional: Make the window transparent
        alwaysOnTop: true, // Keep the splash screen on top
        icon: path.join(resolvePath('@assets'), 'icons', 'icon.ico'), // Set the app icon
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Load the splash screen HTML file
    splashWindow.loadURL('file://' + path.join(resolvePath('@views'), 'splash.html'));

    splashWindow.once('ready-to-show', () => {
        console.log("Show splash screen");
        splashWindow.show(); // Explicitly show the splash screen
    });

    return splashWindow;
}

module.exports = createSplashScreen;
