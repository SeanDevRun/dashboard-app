const { BrowserView } = require('electron');

const { loadConfig } = require('./configHandler');  // Import the config loader
const viewsConfig = require('../configs/viewsConfig');

class ViewsManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.views = [];
    this.createViews();
  }

  createViews() {

    let viewsConfig = loadConfig();

    if (viewsConfig) {

      viewsConfig.views.forEach((config) => {

        console.log(`Creating view for: ${config.url}`);

        const view = new BrowserView({
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
          },
        });

        this.mainWindow.addBrowserView(view);
        this.views.push({ view, config });
        view.webContents.loadURL(config.url);

        // Remove scrollbars but allow scrolling
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
      });

    }
  }

  updateViews() {

    if (viewsConfig) {
      const { width, height } = this.mainWindow.getContentBounds();

      // Calculate the width of each column based on percentages
      const columnWidths = viewsConfig.columnWidths.map((percent) => (width * percent) / 100);
      const rowHeight = height / viewsConfig.rows;

      this.views.forEach(({ view, config }) => {
        // Default rowspan and colspan to 1 if not specified
        const row = config.row ?? 0;
        const col = config.col ?? 0;
        const rowspan = config.rowspan ?? 1;
        const colspan = config.colspan ?? 1;

        // Calculate x position by summing widths of previous columns
        const x = columnWidths.slice(0, col).reduce((sum, w) => sum + w, 0);
        const viewWidth = columnWidths.slice(col, col + colspan).reduce((sum, w) => sum + w, 0);

        view.setBounds({
          x: Math.floor(x),
          y: Math.floor(row * rowHeight),
          width: Math.floor(viewWidth),
          height: Math.floor(rowHeight * rowspan),
        });
      });
    }
  }

  refreshAllViews() {
    this.views.forEach(({ view }) => {
      view.webContents.reload();
    });
  }
}

module.exports = ViewsManager;
