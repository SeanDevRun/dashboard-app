const { BrowserWindow } = require('electron');
const path = require('path');

const { resolvePath } = require('./pathHelpers');

class SplashScreen {
    constructor() {
        this.splashWindow = null;
        this.debug = false;
    }

    showDebug(msg) {
        if (this.debug) {
            console.log(`\n${msg}`)
        }
    }

    create() {

        this.showDebug('Creating SplashScreen.....')

        this.splashWindow = new BrowserWindow({
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
        this.splashWindow.loadURL('file://' + path.join(resolvePath('@views'), 'splash.html'));

        this.splashWindow.once('ready-to-show', () => {
            this.showDebug("Show splash screen");
            this.splashWindow.show(); // Explicitly show the splash screen
        });
    }

    close() {
        this.showDebug('Closing SplashScreen.....')
        this.splashWindow.close();
    }
}

module.exports = SplashScreen;
