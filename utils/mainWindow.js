const { BrowserWindow, globalShortcut, session, app, shell, Menu, MenuItem } = require('electron');
const path = require('path');

const { resolvePath } = require('./pathHelpers');
const ViewsManager = require('./viewsManager');  // Import the ViewsManager class
const { getConfigDirPath } = require('./configHandler');  // Import the config loader

const autoLaunchManager = require('./autoLaunchManager'); // Import the auto-launch manager module

class MainWindow {
    constructor(splashWindow) {
        this.mainWindow = null;
        this.splashScreen = splashWindow;
        this.viewsManager = null;
        this.debug = false;
    }

    showHideMenuBar(menuBarVisible) {
        this.mainWindow.menuBarVisible = menuBarVisible;

        if (this.mainWindow.menuBarVisible) {
            this.showDebug('Show Menubar');
        } else {
            this.showDebug('Hide Menubar');
        }
    }

    showDebug(msg) {
        if (this.debug) {
            console.log(`\n${msg}`)
        }
    }

    addMenuOptions() {
        const currentMenu = Menu.getApplicationMenu();

        if (!currentMenu) {
            console.error('No existing menu found.');
            return;
        }

        // Define the new menu to be inserted
        const toolsMenu = {
            label: 'Tools',
            submenu: [
                {
                    label: 'Open Config',
                    accelerator: 'Ctrl+Shift+?',
                    click: () => {
                        shell.openPath(getConfigDirPath());
                    },
                },
                {
                    label: 'Reload Config',
                    accelerator: 'Ctrl+Shift+D',
                    click: () => {
                        this.viewsManager.reloadConfig();
                    },
                },
                { type: 'separator' },
                {
                    label: 'Show/Hide Toolbar',
                    accelerator: 'Ctrl+Shift+T',
                    click: () => {
                        this.showHideMenuBar(!this.mainWindow.menuBarVisible);
                    },
                },
                { type: 'separator' },
                {
                    label: 'Enable Auto-Launch',
                    type: 'checkbox',
                    checked: false, // Initially unchecked (it will be dynamically set)
                    click: (item) => {
                        if (item.checked) {
                            autoLaunchManager.enableAutoLaunch();  // Enable auto-launch
                            item.label = 'Disable Auto-Launch';
                        } else {
                            autoLaunchManager.disableAutoLaunch(); // Disable auto-launch
                            item.label = 'Enable Auto-Launch';
                        }
                    },
                },
            ],
        };

        this.updateAutoLaunchMenuLabel();

        // Insert the new menu at the desired position (e.g., at index 2)
        const updatedMenuTemplate = currentMenu.items.map((menuItem) => menuItem);
        updatedMenuTemplate.splice(1, 0, toolsMenu); // Insert at the second position

        // Rebuild and set the updated menu
        const updatedMenu = Menu.buildFromTemplate(updatedMenuTemplate);
        Menu.setApplicationMenu(updatedMenu);
    }


    // Function to update the label dynamically based on auto-launch status
    updateAutoLaunchMenuLabel() {
        autoLaunchManager.isAutoLaunchEnabled().then((enabled) => {
            const menu = Menu.getApplicationMenu();
            const settingsMenu = menu.items.find(item => item.label === 'Tools');
            const autoLaunchItem = settingsMenu.submenu.items.find(item => item.label.endsWith('Auto-Launch'));

            if (enabled) {
                autoLaunchItem.label = 'Disable Auto-Launch'; // Update label when auto-launch is enabled
                autoLaunchItem.checked = enabled;
            } else {
                autoLaunchItem.label = 'Enable Auto-Launch'; // Update label when auto-launch is disabled
                autoLaunchItem.checked = enabled;
            }
        });
    }

    create() {

        this.showDebug('Creating MainWindow.....')

        this.mainWindow = new BrowserWindow({
            show: false, // Don't show the main window immediately
            icon: path.join(resolvePath('@assets'), 'icons', 'icon.ico'), // Set the app icon
            webPreferences: {
                nodeIntegration: false, // Disable nodeIntegration for security
                contextIsolation: true, // Enable contextIsolation for security
            },
        });

        // Remove menu bar
        this.mainWindow.menuBarVisible = false;

        // Launch the app in fullscreen mode
        this.mainWindow.fullScreen = true;

        this.viewsManager = new ViewsManager(this.mainWindow); // Initialize ViewsManager
        this.viewsManager.updateViews(); // Initial update of views  

        this.addMenuOptions();

        // Load the content
        this.mainWindow.loadFile(path.join(resolvePath('@views'), 'index.html'));

        // Update views whenever the window is resized
        this.mainWindow.on('resize', () => {
            this.viewsManager.updateViews();
        });

        // Handle window's 'did-finish-load' event
        this.mainWindow.webContents.once('did-finish-load', () => {
            // Close the splash screen once the content is loaded
            this.splashScreen.close();

            this.showDebug("Show main window");
            // Show the main window
            this.mainWindow.show();
        });

        // Toggle toolbar visibility based on fullscreen state
        this.mainWindow.on('enter-full-screen', () => {
            this.showHideMenuBar(false);
        });

        this.mainWindow.on('leave-full-screen', () => {
            this.showHideMenuBar(true);
        });

        // Optional: Handle window close
        this.mainWindow.on('closed', () => {
            app.quit();
        });

    }

}

module.exports = MainWindow;