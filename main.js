const { app } = require('electron');
const path = require('path');
const createSplashScreen = require('./utils/splashScreen'); // Import the splash screen module
const createMainWindow = require('./utils/mainWindow'); // Import the createMainWindow function

let splashWindow;

// Path to the original config file in the app
const defaultConfigPath = path.join(__dirname, 'configs', 'config.json');


app.whenReady().then(() => {
    try {
        // Show the splash screen
        console.log('Creating splash screen');
        splashWindow = createSplashScreen();

        // Create the main window after a short delay
        console.log('Creating main screen');
        createMainWindow(splashWindow); // Pass the splash window to the createMainWindow function
    } catch (error) {
        console.error("Error during app startup:", error);
        app.quit(); // Exit the app if the error is unresolvable
    }
});

// Handle any uncaught exceptions globally
process.on('uncaughtException', (error) => {
    console.error("Uncaught Exception:", error);
    app.quit(); // Exit the app in case of an uncaught exception
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
