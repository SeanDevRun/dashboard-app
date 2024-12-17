const { BrowserWindow, globalShortcut, session, app } = require('electron');
const path = require('path');

const { resolvePath } = require('./pathHelpers');
const ViewsManager = require('./viewsManager');  // Import the ViewsManager class

function createMainWindow(splashWindow) {
    let mainWindow = new BrowserWindow({
        fullscreen: true, // Launch the app in fullscreen mode
        titleBarStyle: 'hidden', // Optional: Remove the title bar
        show: false, // Don't show the main window immediately
        icon: path.join(resolvePath('@assets'), 'icons', 'icon.ico'), // Set the app icon
        webPreferences: {
            nodeIntegration: false, // Disable nodeIntegration for security
            contextIsolation: true, // Enable contextIsolation for security
        },
    });

    let viewsManager = new ViewsManager(mainWindow); // Initialize ViewsManager
    viewsManager.updateViews(); // Initial update of views    

    // Load the content
    mainWindow.loadFile(path.join(resolvePath('@views'), 'index.html'));

    // Update views whenever the window is resized
    mainWindow.on('resize', () => {
        viewsManager.updateViews();
    });

    // Register a global shortcut to refresh all views (e.g., Ctrl+R)
    globalShortcut.register('CommandOrControl+R', () => {
        viewsManager.refreshAllViews();
    });

    // Register a global shortcut to clear cache (e.g., Ctrl+Shift+C)
    globalShortcut.register('CommandOrControl+Shift+C', () => {
        session.defaultSession.clearCache().then(() => {
            console.log('Cache cleared successfully');
            viewsManager.refreshAllViews();
        });
    });

    // Handle window's 'did-finish-load' event
    mainWindow.webContents.once('did-finish-load', () => {
        console.log("Close splash screen");
        // Close the splash screen once the content is loaded
        splashWindow.close();

        console.log("Show main window");
        // Show the main window
        mainWindow.show();
    });

    // Optional: Handle window close
    mainWindow.on('closed', () => {
        app.quit();
    });

    return mainWindow; // Return the main window instance
}

module.exports = createMainWindow;
