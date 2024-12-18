const { app } = require('electron');
const SplashWindow = require('./utils/splashScreen'); // Import the splash screen module
const MainWindow = require('./utils/mainWindow');  // Import the ViewsManager class


let mainWindow;
let splashScreen;

app.whenReady().then(() => {
    try {
        // Show the splash screen
        splashScreen = new SplashWindow();
        splashScreen.create();

        // Create the main window after a short delay
        mainWindow = new MainWindow(splashScreen);
        mainWindow.create();
        
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
