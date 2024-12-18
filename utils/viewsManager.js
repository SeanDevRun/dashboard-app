const { WebContentsView } = require('electron');

const { loadConfig, getConfigPath } = require('./configHandler');  // Import the config loader

class ViewsManager {
  constructor(mainWindow) {
    this.debug = true;
    this.mainWindow = mainWindow;
    this.views = [];
    this.configPath = getConfigPath();
    this.userSettings = loadConfig();
    this.createViews();
  }

  showDebug(msg) {
    if (this.debug) {
      console.log(`\n${msg}`)
    }
  }

  // Reload config and reset views
  reloadConfig() {

    this.showDebug('Reloading Config...')
    this.userSettings = loadConfig();
    this.removeAllViews();
    this.createViews();
    this.updateViews();

  }

  // Function to remove all BrowserViews and WebContentsViews
  removeAllViews() {

    this.views.forEach(({ view }) => {
      this.mainWindow.contentView.removeChildView(view); // Remove the BrowserView
    });
    this.views = [];

  }

  // Create and add views based on the config
  createViews() {

    if (!this.userSettings) {
      this.showDebug('No user settings found.');
      return;
    }

    this.userSettings.views.forEach((config) => {
      const { enabled = true } = config;

      if (enabled) {
        this.showDebug(`Creating view for: ${config.url}`);
        this.createView(config);
      }
    });

  }

  // Create either a BrowserView or WebContentsView
  createView(config) {

    let view;

    view = new WebContentsView({
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: true,
      },
    });

    this.mainWindow.contentView.addChildView(view);

    this.views.push({ view, config });
    view.webContents.loadURL(config.url);

    this.injectCSS(view);
  }

  // Inject CSS to remove scrollbars but allow scrolling
  injectCSS(view) {
    view.webContents.on('dom-ready', () => {
      view.webContents.insertCSS(`
          body {
            overflow: auto !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          ::-webkit-scrollbar {
            display: none !important;
          }
        `);
    });
  }

  // Update view sizes based on the configuration
  updateViews() {
    if (!this.userSettings) {
      this.showDebug('No user settings found.');
      return;
    }

    const { width, height } = this.mainWindow.getContentBounds();

    // Calculate the width of each column based on percentages
    const columnWidths = this.userSettings.layout.columns.map((percent) => (width * percent) / 100);

    // Calculate the height of each row based on percentages
    const rowHeights = this.userSettings.layout.rows.map((percent) => (height * percent) / 100);

    // console.log(rowHeights);
    // console.log(columnWidths);

    this.views.forEach(({ view, config }) => {
      // Default rowspan and colspan to 1 if not specified
      const row = config.row ?? 0;
      const col = config.col ?? 0;
      const rowspan = config.rowspan ?? 1;
      const colspan = config.colspan ?? 1;

      // Calculate x position by summing widths of previous columns
      const x = columnWidths.slice(0, col).reduce((sum, w) => sum + w, 0);
      const viewWidth = columnWidths.slice(col, col + colspan).reduce((sum, w) => sum + w, 0);

      // Calculate the y position based on the row height for the specific row
      const y = rowHeights.slice(0, row).reduce((sum, h) => sum + h, 0);
      const viewHeight = rowHeights[row] * rowspan;

      view.setBounds({
        x: Math.floor(x),
        y: Math.floor(y),
        width: Math.floor(viewWidth),
        height: Math.floor(viewHeight),
      });
    });

  }

  // Calculate column widths based on the configuration percentages
  calculateColumnWidths(totalWidth) {
    return this.userSettings.columnWidths.map((percent) => (totalWidth * percent) / 100);
  }

  // Refresh all views by reloading their content
  refreshAllViews() {
    this.views.forEach(({ view }) => {
      view.webContents.reload();
    });
  }

}

module.exports = ViewsManager;
